"use client";

import {useEffect, useState} from "react";
import {Button, Input, Modal, ModalBody, ModalContent, ModalHeader} from "@heroui/react";
import {Lock, Pencil} from "lucide-react";
import {sendVerificationCode, updatePassword, updateUserInfo, UserInfo} from "@utils/api/member";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useTranslations} from "next-intl";

interface ProfileProps {
  user: UserInfo;
  onUpdate?: () => void;
}

// 信息项组件 - 移到组件外部定义，避免每次渲染都重新创建
const InfoItem = ({label, value, action, t}: {
  label: string;
  value?: string;
  action?: React.ReactNode;
  t: ReturnType<typeof useTranslations>;
}) => (
    <div className="flex justify-between items-center py-3 -mx-4 px-4">
      <div className="flex-1">
        <p className="text-sm text-default-500">{label}</p>
        <p className="font-semibold text-default-900 mt-0.5">{value || t("na")}</p>
      </div>
      {action}
    </div>
);

export const Profile = ({user, onUpdate}: ProfileProps) => {
  const t = useTranslations("profile");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const [editForm, setEditForm] = useState({
    nickname: user?.nickname || "",
    avatar: user?.avatar || "",
    sex: user?.sex || 1,
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    password: "",
    code: "",
  });

  const [countdown, setCountdown] = useState(0);

  const updateMutation = useMutation({
    mutationFn: updateUserInfo,
    onSuccess: () => {
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({queryKey: ["userInfo"]});
      onUpdate?.();
    },
  });

  const passwordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      setIsPasswordModalOpen(false);
      setPasswordForm({password: "", code: ""});
      alert(t("passwordSuccess"));
    },
  });

  const sendCodeMutation = useMutation({
    mutationFn: sendVerificationCode,
    onSuccess: () => {
      setCountdown(60);
      alert(t("codeSent"));
    },
  });

  const handleSendCode = () => {
    if (!user?.email) {
      alert(t("setEmailFirst"));
      return;
    }
    sendCodeMutation.mutate({email: user.email});
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateMutation.mutate(editForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    passwordMutation.mutate(passwordForm);
  };

  return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        {/* 页面标题 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-default-900">{t("title")}</h2>
        </div>

        {/* 个人信息 - 手机端简洁设计，桌面端保留卡片 */}
        <div className="md:hidden divide-y divide-default-100 border-y border-default-100">
          <InfoItem label={t("fullName")} value={user?.nickname} t={t}/>
          <InfoItem label={t("emailAddress")} value={user?.email} t={t}/>
          <InfoItem label={t("memberSince")} value="2024-01-01" t={t}/>
        </div>

        {/* 桌面端 - 卡片设计 */}
        <div className="hidden md:block bg-white border border-default-100 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center py-4 border-b border-default-50 last:border-b-0">
              <div className="flex-1">
                <p className="text-sm text-default-500">{t("fullName")}</p>
                <p className="font-semibold text-default-900 mt-1">{user?.nickname || t("na")}</p>
              </div>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-default-50 last:border-b-0">
              <div className="flex-1">
                <p className="text-sm text-default-500">{t("emailAddress")}</p>
                <p className="font-semibold text-default-900 mt-1">{user?.email || t("na")}</p>
              </div>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-default-50 last:border-b-0">
              <div className="flex-1">
                <p className="text-sm text-default-500">{t("memberSince")}</p>
                <p className="font-semibold text-default-900 mt-1">2024-01-01</p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮区域 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
              variant="flat"
              color="primary"
              startContent={<Pencil size={18}/>}
              onPress={() => setIsEditModalOpen(true)}
              className="h-12 font-semibold justify-start md:justify-center"
          >
            {t("editProfile")}
          </Button>
          <Button
              variant="flat"
              color="default"
              startContent={<Lock size={18}/>}
              onPress={() => setIsPasswordModalOpen(true)}
              className="h-12 font-semibold justify-start md:justify-center"
          >
            {t("changePassword")}
          </Button>
        </div>

        {/* 编辑资料弹窗 */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} placement="center" size="2xl">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-xl font-bold">{t("editProfile")}</h3>
            </ModalHeader>
            <ModalBody className="pb-6">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <Input
                    label={t("nickname")}
                    placeholder={t("enterNickname")}
                    value={editForm.nickname}
                    onValueChange={(value) => setEditForm({...editForm, nickname: value})}
                    isRequired
                    labelPlacement="outside"
                    classNames={{
                      label: "font-semibold text-default-700",
                      input: "text-base",
                    }}
                />
                <Input
                    label={t("avatarUrl")}
                    placeholder={t("enterAvatarUrl")}
                    value={editForm.avatar}
                    onValueChange={(value) => setEditForm({...editForm, avatar: value})}
                    labelPlacement="outside"
                    classNames={{
                      label: "font-semibold text-default-700",
                      input: "text-base",
                    }}
                />
                <Input
                    label={t("email")}
                    type="email"
                    placeholder={t("enterEmail")}
                    value={editForm.email}
                    onValueChange={(value) => setEditForm({...editForm, email: value})}
                    labelPlacement="outside"
                    classNames={{
                      label: "font-semibold text-default-700",
                      input: "text-base",
                    }}
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                      type="button"
                      variant="flat"
                      onPress={() => setIsEditModalOpen(false)}
                      className="font-semibold"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                      type="submit"
                      color="primary"
                      isLoading={updateMutation.isPending}
                      className="font-semibold"
                  >
                    {t("saveChanges")}
                  </Button>
                </div>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* 修改密码弹窗 */}
        <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} placement="center" size="md">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-xl font-bold">{t("changePassword")}</h3>
            </ModalHeader>
            <ModalBody className="pb-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input
                    label={t("newPassword")}
                    type="password"
                    placeholder={t("enterNewPassword")}
                    value={passwordForm.password}
                    onValueChange={(value) => setPasswordForm({...passwordForm, password: value})}
                    isRequired
                    labelPlacement="outside"
                    classNames={{
                      label: "font-semibold text-default-700",
                      input: "text-base",
                    }}
                />
                <Input
                    label={t("verificationCode")}
                    placeholder={t("enterVerificationCode")}
                    value={passwordForm.code}
                    onValueChange={(value) => setPasswordForm({...passwordForm, code: value})}
                    isRequired
                    labelPlacement="outside"
                    classNames={{
                      label: "font-semibold text-default-700",
                      input: "text-base",
                    }}
                    endContent={
                      <Button
                          size="sm"
                          variant="light"
                          color="primary"
                          isDisabled={countdown > 0 || sendCodeMutation.isPending}
                          onPress={handleSendCode}
                          className="font-semibold min-w-[100px]"
                      >
                        {countdown > 0 ? `${countdown}s` : t("sendCode")}
                      </Button>
                    }
                />
                <p className="text-sm text-default-500">
                  {t("codeSentToEmail")}
                </p>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                      type="button"
                      variant="flat"
                      onPress={() => setIsPasswordModalOpen(false)}
                      className="font-semibold"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                      type="submit"
                      color="primary"
                      isLoading={passwordMutation.isPending}
                      className="font-semibold"
                  >
                    {t("updatePassword")}
                  </Button>
                </div>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
  );
};