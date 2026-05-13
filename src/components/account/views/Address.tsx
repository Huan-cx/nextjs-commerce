import React, {useState} from "react";
import {Button, Card, CardBody, Checkbox, Modal, ModalContent, Radio, RadioGroup} from "@heroui/react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {addAddress, deleteAddress, getAddressList, updateAddress} from "@utils/api/address";
import {useForm} from "react-hook-form";
import InputText from "@components/common/form/Input";
import CountrySelect from "@components/common/form/country";
import {AddressLine} from "@/types/api/address/type";
import {useTranslations} from "next-intl";

export const Address = () => {
  const t = useTranslations("address");
  const queryClient = useQueryClient();
  const {data: addresses = []} = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddressList,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressLine | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAddressType, setSelectedAddressType] = useState<number>(2);
  const [isDefaultAddress, setIsDefaultAddress] = useState(false); // 默认为收货地址

  const {register, control, handleSubmit, reset} = useForm({
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      companyName: "",
      address: "",
      street: "",
      country: "",
      state: "",
      city: "",
      postcode: "",
      phone: "",
      vat: "",
      eori: "",
      type: 2, // 默认为收货地址
      defaultStatus: false,
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["addresses"]});
      setIsModalOpen(false);
      reset();
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: updateAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["addresses"]});
      setIsModalOpen(false);
      setEditingAddress(null);
      setIsEditing(false);
      reset();
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["addresses"]});
    },
  });

  const handleAddNew = () => {
    setIsEditing(false);
    setEditingAddress(null);
    setSelectedAddressType(2);
    setIsDefaultAddress(false);
    reset();
    setIsModalOpen(true);
  };

  const handleEdit = (address: AddressLine) => {
    setIsEditing(true);
    setEditingAddress(address);
    setSelectedAddressType(address.type || 2);
    setIsDefaultAddress(address.defaultStatus || false);
    reset({
      firstName: address.firstName || "",
      lastName: address.lastName || "",
      companyName: address.companyName || "",
      address: address.address || "",
      street: address.street || "",
      country: address.country || "",
      state: address.state || "",
      city: address.city || "",
      postcode: address.postcode || "",
      phone: address.phone || "",
      vat: address.vat || "",
      eori: address.eori || "",
      type: address.type || 2,
      defaultStatus: address.defaultStatus || false,
    });
    setIsModalOpen(true);
  };

  const handleSetDefault = async (address: AddressLine) => {
    try {
      await updateAddressMutation.mutateAsync({
        ...address,
        defaultStatus: true,
      });
    } catch (error) {
      console.error('Failed to set default address:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAddressMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const addressData = {
        ...data,
        type: selectedAddressType,
        defaultStatus: isDefaultAddress,
      };

      if (isEditing && editingAddress) {
        await updateAddressMutation.mutateAsync({
          ...addressData,
          id: editingAddress.id,
        });
      } else {
        await addAddressMutation.mutateAsync(addressData);
      }
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t("title")}</h2>
          <Button
              color="primary"
              size="sm"
              radius="full"
              onPress={handleAddNew}
          >
            {t("addNew")}
          </Button>
        </div>

        {/* 地址卡片列表 */}
        {addresses.map((address) => {
          const addressTypeLabels: Record<number, string> = {
            1: t("billing"),
            2: t("shipping"),
            3: t("business"),
          };
          const addressTypeLabel = addressTypeLabels[address.type] || t("unknown");

          return (
              <Card key={address.id} shadow="sm" className="border-none bg-default-50">
                <CardBody
                    className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <p className="font-bold text-base sm:text-lg">{address.firstName} {address.lastName}</p>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                      {addressTypeLabel}
                    </span>
                      {address.defaultStatus && (
                          <span
                              className="px-2 py-0.5 text-xs font-medium rounded-full bg-success-100 text-success-700">
                        {t("default")}
                      </span>
                      )}
                    </div>
                    <p className="text-sm text-default-600 mb-1">{address.address}</p>
                    <p className="text-xs text-default-400">{address.city}, {address.state}, {address.country}</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        size="sm"
                        variant="flat"
                        className="flex-1 sm:flex-none"
                        onClick={() => handleEdit(address)}
                    >
                      {t("edit")}
                    </Button>
                    {!address.defaultStatus && (
                        <Button
                            size="sm"
                            variant="flat"
                            className="flex-1 sm:flex-none"
                            onClick={() => handleSetDefault(address)}
                        >
                          {t("setDefault")}
                        </Button>
                    )}
                    <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        className="flex-1 sm:flex-none"
                        onClick={() => handleDelete(address.id)}
                    >
                      {t("delete")}
                    </Button>
                  </div>
                </CardBody>
              </Card>
          );
        })}

        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            size="2xl"
            scrollBehavior="inside"
            classNames={{
              wrapper: "sm:items-center items-end",
              base: "max-h-[90vh] sm:max-h-[85vh] m-0 sm:m-4 rounded-t-2xl sm:rounded-2xl",
            }}
        >
          <ModalContent className="p-4 sm:p-6 overflow-y-auto">
            <div className="space-y-4 sm:space-y-6">
              <div className="border-b pb-3 sm:pb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {isEditing ? t("editAddress") : t("addNew")}
                </h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-0">
                <div className="flex flex-col gap-y-4 overflow-y-auto">

                  {/* --- 地址类型：手机端强制纵向排列或网格 --- */}
                  <div className="bg-default-50 p-3 rounded-xl border border-default-100">
                    <label className="block text-xs font-bold uppercase text-default-500 mb-3 tracking-wide">
                      {t("addressType")}
                    </label>
                    <RadioGroup
                        value={selectedAddressType.toString()}
                        onValueChange={(value) => setSelectedAddressType(parseInt(value))}
                        orientation="vertical"
                        className="sm:flex-wrap gap-3"
                    >
                      <Radio value="2" classNames={{label: "text-sm", description: "text-xs"}}>{t("shipping")}</Radio>
                      <Radio value="1" classNames={{label: "text-sm", description: "text-xs"}}>{t("billing")}</Radio>
                      <Radio value="3" classNames={{label: "text-sm", description: "text-xs"}}>{t("business")}</Radio>
                    </RadioGroup>
                  </div>

                  {/* --- 个人信息：手机端 1x2 -> 2x1 --- */}
                  <div className="grid grid-cols-2 gap-3">
                    <InputText
                        {...register("firstName", {required: t("required")})}
                        className="col-span-2 sm:col-span-1"
                        label={t("firstName")}
                        size="md"
                    />
                    <InputText
                        {...register("lastName", {required: t("required")})}
                        className="col-span-2 sm:col-span-1"
                        label={t("lastName")}
                        size="md"
                    />
                  </div>

                  {/* --- 商务信息：移动端去掉内边距感，改用边框区分 --- */}
                  <div
                      className="grid grid-cols-2 gap-3 p-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <InputText {...register("companyName")} className="col-span-2" label={t("company")}/>
                    <InputText {...register("vat")} className="col-span-1" label="VAT"/>
                    <InputText {...register("eori")} className="col-span-1" label="EORI"/>
                  </div>

                  {/* --- 地址主信息 --- */}
                  <div className="space-y-4">
                    <InputText {...register("address", {required: t("required")})} label={t("addressLine1")}/>
                    <InputText {...register("street")} label={t("addressLine2")}/>

                    <div className="grid grid-cols-2 gap-3">
                      <CountrySelect control={control} name="country" label={t("country")}
                                     className="col-span-2 sm:col-span-1"/>
                      <InputText {...register("state")} className="col-span-1" label={t("state")}/>
                      <InputText {...register("city")} className="col-span-1" label={t("city")}/>
                      <InputText {...register("postcode")} className="col-span-2 sm:col-span-1" label={t("zipCode")}/>
                    </div>
                  </div>

                  <InputText
                      {...register("phone", {required: t("required")})}
                      type="tel"
                      label={t("phoneNumber")}
                  />

                  {/* --- 设为默认地址 --- */}
                  <div className="flex items-center gap-3 p-3 bg-default-50 rounded-xl border border-default-100">
                    <Checkbox
                        isSelected={isDefaultAddress}
                        onValueChange={setIsDefaultAddress}
                        size="md"
                        classNames={{
                          label: "text-sm font-medium text-default-700",
                        }}
                    >
                      {t("setAsDefault")}
                    </Checkbox>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-4 border-t flex-shrink-0">
                  <Button
                      type="button"
                      variant="flat"
                      className="w-full sm:w-auto"
                      onPress={() => setIsModalOpen(false)}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                      type="submit"
                      color="primary"
                      className="w-full sm:w-auto px-10 shadow-lg"
                      isLoading={addAddressMutation.isPending || updateAddressMutation.isPending}
                  >
                    {isEditing ? t("update") : t("saveAddress")}
                  </Button>
                </div>
              </form>
            </div>
          </ModalContent>
        </Modal>


      </div>
  );
};