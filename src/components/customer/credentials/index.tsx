import CredentialModal from "./CredentialModal";

export default function UserAccount({
  children,
  className,
  onOpen,
  onClose,
  isOpen,
}: {
  children?: React.ReactNode;
  className?: string;
  onOpen?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
}) {
  return (
    <CredentialModal className={className} onOpen={onOpen} onClose={onClose} isOpen={isOpen}>
      {children}
    </CredentialModal>
  );
}
