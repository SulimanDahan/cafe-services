import AdminModal from "@/components/partials/modals/admin_modal";
import { PrimaryButton } from "@/components/button/primary_button";
import { useLanguage } from "@/config/i18n";

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string | null;
}

export default function ErrorModal({ isOpen, onClose, message }: ErrorModalProps) {
    const { t } = useLanguage();
    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={t("common.error")}
        >
            <div className="space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                    <svg className="w-6 h-6 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm text-red-200 font-medium leading-relaxed">
                        {message}
                    </p>
                </div>
                <div className="flex justify-end pt-2">
                    <PrimaryButton
                        type="button"
                        onClick={onClose}
                        variant="secondary"
                        size="md"
                    >
                        {t("common.cancel")}
                    </PrimaryButton>
                </div>
            </div>
        </AdminModal>
    );
}
