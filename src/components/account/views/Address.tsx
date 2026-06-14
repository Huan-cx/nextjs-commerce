"use client";

import React, {useState} from "react";
import {Button, Card, CardBody, Checkbox, Modal, ModalContent, Radio, RadioGroup} from "@heroui/react";
import {MapPin, Pencil, Plus, Trash2} from "lucide-react";
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
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);

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
      type: 2,
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

  const addressTypeLabels: Record<number, string> = {
    1: t("billing"),
    2: t("shipping"),
    3: t("importer"),
  };

  return (
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold text-default-900">{t("title")}</h2>
          <Button
              color="primary"
              startContent={<Plus size={18}/>}
              onPress={handleAddNew}
              className="font-semibold"
          >
            {t("addNew")}
          </Button>
        </div>

        {/* 地址列表 - 手机端使用简洁分割线设计，桌面端保留 Card */}
        <div className="md:hidden space-y-0 divide-y divide-default-100 border-y border-default-100 -mx-4 px-4">
          {addresses.map((address) => (
              <div key={address.id} className="py-4">
                <div className="flex flex-col gap-3">
                  {/* 地址信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <p className="font-bold text-default-900 text-base">
                        {address.firstName} {address.lastName}
                      </p>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                        {addressTypeLabels[address.type] || t("unknown")}
                      </span>
                      {address.defaultStatus && (
                          <span
                              className="px-2 py-0.5 text-xs font-semibold rounded-full bg-success/10 text-success">
                            {t("default")}
                          </span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-default-700 text-sm">{address.address}</p>
                      {address.street && <p className="text-default-600 text-sm">{address.street}</p>}
                      <p className="text-default-600 text-sm">
                        {address.city}, {address.state}, {address.country} {address.postcode}
                      </p>
                      <p className="text-default-500 text-xs">{t("phone")}: {address.phone}</p>
                      {address.companyName && (
                          <p className="text-default-500 text-xs">{t("company")}: {address.companyName}</p>
                      )}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                        size="sm"
                        variant="light"
                        startContent={<Pencil size={14}/>}
                        onPress={() => handleEdit(address)}
                        className="font-medium h-8 min-w-0"
                    >
                      {t("edit")}
                    </Button>
                    {!address.defaultStatus && (
                        <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => handleSetDefault(address)}
                            className="font-medium h-8 min-w-0"
                        >
                          {t("setDefault")}
                        </Button>
                    )}
                    <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        startContent={<Trash2 size={14}/>}
                        onPress={() => handleDelete(address.id)}
                        className="font-medium h-8 min-w-0"
                    >
                      {t("delete")}
                    </Button>
                  </div>
                </div>
              </div>
          ))}
        </div>

        {/* 桌面端地址列表 - 保留 Card 设计 */}
        <div className="hidden md:block space-y-4">
          {addresses.map((address) => (
              <Card key={address.id} shadow="sm" className="border border-default-100">
                <CardBody className="p-5">
                  <div className="flex flex-row items-start gap-4">
                    {/* 左侧：地址信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin size={18} className="text-default-400"/>
                          <p className="font-bold text-default-900 text-base">
                            {address.firstName} {address.lastName}
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                          {addressTypeLabels[address.type] || t("unknown")}
                        </span>
                        {address.defaultStatus && (
                            <span
                                className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-success/10 text-success">
                              {t("default")}
                            </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-default-700">{address.address}</p>
                        {address.street && <p className="text-default-600 text-sm">{address.street}</p>}
                        <p className="text-default-600">
                          {address.city}, {address.state}, {address.country} {address.postcode}
                        </p>
                        <p className="text-default-500 text-sm">{t("phone")}: {address.phone}</p>
                        {address.companyName && (
                            <p className="text-default-500 text-sm">{t("company")}: {address.companyName}</p>
                        )}
                      </div>
                    </div>

                    {/* 右侧：操作按钮 */}
                    <div className="flex flex-col gap-2 flex-nowrap w-auto">
                      <Button
                          size="sm"
                          variant="flat"
                          startContent={<Pencil size={16}/>}
                          onPress={() => handleEdit(address)}
                          className="font-medium"
                      >
                        {t("edit")}
                      </Button>
                      {!address.defaultStatus && (
                          <Button
                              size="sm"
                              variant="flat"
                              color="primary"
                              onPress={() => handleSetDefault(address)}
                              className="font-medium"
                          >
                            {t("setDefault")}
                          </Button>
                      )}
                      <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          startContent={<Trash2 size={16}/>}
                          onPress={() => handleDelete(address.id)}
                          className="font-medium"
                      >
                        {t("delete")}
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
          ))}
        </div>

        {/* 空状态 */}
        {addresses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-default-400">
              <MapPin size={48} className="mb-4 opacity-50"/>
              <p className="text-lg font-medium">{t("noAddresses")}</p>
              <p className="text-sm mt-1">{t("addFirstAddress")}</p>
              <Button
                  color="primary"
                  variant="flat"
                  startContent={<Plus size={18}/>}
                  onPress={handleAddNew}
                  className="mt-4 font-semibold"
              >
                {t("addNew")}
              </Button>
            </div>
        )}

        {/* 添加/编辑地址弹窗 */}
        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            size="2xl"
            scrollBehavior="inside"
            placement="center"
        >
          <ModalContent className="p-0">
            <div className="p-6 border-b border-default-100">
              <h2 className="text-xl font-bold text-default-900">
                {isEditing ? t("editAddress") : t("addNew")}
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* 地址类型 */}
              <div className="bg-default-50 p-4 rounded-xl">
                <label className="block text-sm font-semibold text-default-700 mb-3">
                  {t("addressType")}
                </label>
                <RadioGroup
                    value={selectedAddressType.toString()}
                    onValueChange={(value) => setSelectedAddressType(parseInt(value))}
                    orientation="horizontal"
                    className="flex-wrap gap-3"
                >
                  <Radio value="2" classNames={{label: "text-sm font-medium"}}>{t("shipping")}</Radio>
                  <Radio value="1" classNames={{label: "text-sm font-medium"}}>{t("billing")}</Radio>
                  <Radio value="3" classNames={{label: "text-sm font-medium"}}>{t("importer")}</Radio>
                </RadioGroup>
              </div>

              {/* 个人信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputText
                    {...register("firstName", {required: t("required")})}
                    label={t("firstName")}
                    labelPlacement="outside"
                />
                <InputText
                    {...register("lastName", {required: t("required")})}
                    label={t("lastName")}
                    labelPlacement="outside"
                />
              </div>

              {/* 公司信息 */}
              <div className="space-y-4 p-4 bg-default-50/50 rounded-xl border border-dashed border-default-200">
                <InputText
                    {...register("companyName")}
                    label={t("company")}
                    labelPlacement="outside"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputText {...register("vat")} label="VAT" labelPlacement="outside"/>
                  <InputText {...register("eori")} label="EORI" labelPlacement="outside"/>
                </div>
              </div>

              {/* 地址详细信息 */}
              <div className="space-y-4">
                <InputText
                    {...register("address", {required: t("required")})}
                    label={t("addressLine1")}
                    labelPlacement="outside"
                />
                <InputText
                    {...register("street")}
                    label={t("addressLine2")}
                    labelPlacement="outside"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CountrySelect
                      control={control}
                      name="country"
                      label={t("country")}
                  />
                  <InputText {...register("state")} label={t("state")} labelPlacement="outside"/>
                  <InputText {...register("city")} label={t("city")} labelPlacement="outside"/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputText
                      {...register("postcode")}
                      label={t("zipCode")}
                      labelPlacement="outside"
                  />
                  <InputText
                      {...register("phone", {required: t("required")})}
                      type="tel"
                      label={t("phoneNumber")}
                      labelPlacement="outside"
                  />
                </div>
              </div>

              {/* 设为默认地址 */}
              <div className="flex items-center gap-3 p-4 bg-default-50 rounded-xl">
                <Checkbox
                    isSelected={isDefaultAddress}
                    onValueChange={setIsDefaultAddress}
                    classNames={{
                      label: "text-sm font-semibold text-default-700",
                    }}
                >
                  {t("setAsDefault")}
                </Checkbox>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end gap-3 pt-4 border-t border-default-100">
                <Button
                    type="button"
                    variant="flat"
                    onPress={() => setIsModalOpen(false)}
                    className="font-semibold"
                >
                  {t("cancel")}
                </Button>
                <Button
                    type="submit"
                    color="primary"
                    isLoading={addAddressMutation.isPending || updateAddressMutation.isPending}
                    className="font-semibold"
                >
                  {isEditing ? t("update") : t("saveAddress")}
                </Button>
              </div>
            </form>
          </ModalContent>
        </Modal>
      </div>
  );
};