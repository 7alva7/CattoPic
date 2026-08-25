import { useState, useEffect } from 'react';
import { validateApiKey, getApiKey, setApiKey as saveApiKey } from '../utils/auth';
import { ApiKeyModalProps } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckIcon, LockClosedIcon, InfoCircledIcon, Spinner } from '../components/ui/icons';
import { Modal, ModalPanel, ModalHeader, ModalFooter, ModalIconBadge } from './ui/Modal';

export default function ApiKeyModal({ isOpen, onClose, onSuccess }: ApiKeyModalProps) {
    const [apiKey, setApiKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [hasExistingKey, setHasExistingKey] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setHasExistingKey(Boolean(getApiKey()));
            setApiKey('');
            setError('');
            setShowSuccess(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKey.trim()) {
            setError('请输入API Key');
            return;
        }

        setIsValidating(true);
        setError('');

        try {
            const isValid = await validateApiKey(apiKey);
            if (isValid) {
                setShowSuccess(true);
                saveApiKey(apiKey);
                setTimeout(() => {
                    setShowSuccess(false);
                    onSuccess(apiKey);
                    onClose();
                }, 1200);
            } else {
                setError('API Key无效，请重试');
            }
        } catch {
            setError('验证失败，请重试');
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalPanel className="max-w-md">
                <ModalHeader
                    title={hasExistingKey ? 'API 密钥' : 'API 密钥验证'}
                    icon={
                        <ModalIconBadge tone={showSuccess ? 'green' : 'indigo'}>
                            {showSuccess ? (
                                <CheckIcon className="h-5 w-5" />
                            ) : (
                                <LockClosedIcon className="h-5 w-5" />
                            )}
                        </ModalIconBadge>
                    }
                />

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {hasExistingKey
                                ? '输入新密钥即可更换当前密钥。'
                                : '请输入 API 密钥后开始上传和管理图片。'}
                        </p>

                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <LockClosedIcon className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="input-primary pl-10"
                                placeholder="输入您的 API 密钥"
                                autoFocus
                            />
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                                >
                                    <InfoCircledIcon className="mt-0.5 h-4 w-4 shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <ModalFooter>
                        <button type="button" onClick={onClose} className="btn-secondary">
                            {hasExistingKey ? '关闭' : '取消'}
                        </button>
                        <button
                            type="submit"
                            disabled={isValidating || showSuccess}
                            className="btn-primary"
                        >
                            {isValidating ? (
                                <>
                                    <Spinner className="-ml-1 mr-2 h-4 w-4 text-white" />
                                    验证中
                                </>
                            ) : showSuccess ? (
                                <>
                                    <CheckIcon className="mr-2 h-4 w-4 text-white" />
                                    验证成功
                                </>
                            ) : hasExistingKey ? '更换并验证' : '验证'}
                        </button>
                    </ModalFooter>
                </form>
            </ModalPanel>
        </Modal>
    );
}
