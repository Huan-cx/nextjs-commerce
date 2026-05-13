"use client";

import {useEffect, useState} from "react";
import {Button, Input, Modal, ModalBody, ModalContent, ModalHeader} from "@heroui/react";
import {sendVerificationCode, updatePassword, updateUserInfo, UserInfo} from "@utils/api/member";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useTranslations} from "next-intl";

interface ProfileProps {
  user: UserInfo;
  onUpdate?: () => void;
}

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
      <div className="flex justify-between items-center mb-4 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-default-900">{t("title")}</h2>
        <div className="flex gap-2">
          <Button
              variant="flat"
              size="sm"
              radius="full"
              onPress={() => setIsEditModalOpen(true)}
          >
            {t("editProfile")}
          </Button>
          <Button
              variant="flat"
              size="sm"
              radius="full"
              onPress={() => setIsPasswordModalOpen(true)}
          >
            {t("changePassword")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6">
        {[
          {label: t("fullName"), value: user?.nickname},
          {label: t("emailAddress"), value: user?.email},
          {label: t("memberSince"), value: "2024-01-01"},
        ].map((item) => (
            <div key={item.label}
                 className="flex flex-col md:flex-row md:items-center border-b border-default-50 pb-3 md:pb-4">
              <span className="text-default-500 text-sm md:w-64">{item.label}</span>
              <span className="font-semibold text-default-800">{item.value || t("na")}</span>
            </div>
        ))}
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="2xl">
        <ModalContent>
          <ModalHeader>{t("editProfile")}</ModalHeader>
          <ModalBody>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <Input
                  label={t("nickname")}
                  placeholder={t("enterNickname")}
                  value={editForm.nickname}
                  onValueChange={(value) => setEditForm({...editForm, nickname: value})}
                  isRequired
              />
              <Input
                  label={t("avatarUrl")}
                  placeholder={t("enterAvatarUrl")}
                  value={editForm.avatar}
                  onValueChange={(value) => setEditForm({...editForm, avatar: value})}
              />
              <Input
                  label={t("email")}
                  type="email"
                  placeholder={t("enterEmail")}
                  value={editForm.email}
                  onValueChange={(value) => setEditForm({...editForm, email: value})}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button
                    type="button"
                    variant="light"
                    onPress={() => setIsEditModalOpen(false)}
                >
                  {t("cancel")}
                </Button>
                <Button
                    type="submit"
                    color="primary"
                    isLoading={updateMutation.isPending}
                >
                  {t("saveChanges")}
                </Button>
              </div>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} size="md">
        <ModalContent>
          <ModalHeader>{t("changePassword")}</ModalHeader>
          <ModalBody>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                  label={t("newPassword")}
                  type="password"
                  placeholder={t("enterNewPassword")}
                  value={passwordForm.password}
                  onValueChange={(value) => setPasswordForm({...passwordForm, password: value})}
                  isRequired
              />
              <Input
                  label={t("verificationCode")}
                  placeholder={t("enterVerificationCode")}
                  value={passwordForm.code}
                  onValueChange={(value) => setPasswordForm({...passwordForm, code: value})}
                  isRequired
                  endContent={
                    <Button
                        size="sm"
                        variant="light"
                        isDisabled={countdown > 0 || sendCodeMutation.isPending}
                        onPress={handleSendCode}
                    >
                      {countdown > 0 ? `${countdown}s` : t("sendCode")}
                    </Button>
                  }
              />
              <p className="text-sm text-default-500">
                {t("codeSentToEmail")}
              </p>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                    type="button"
                    variant="light"
                    onPress={() => setIsPasswordModalOpen(false)}
                >
                  {t("cancel")}
                </Button>
                <Button
                    type="submit"
                    color="primary"
                    isLoading={passwordMutation.isPending}
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