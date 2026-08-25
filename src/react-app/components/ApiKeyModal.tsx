import { useState, useEffect } from 'react';
import { validateApiKey, getApiKey, removeApiKey, setApiKey as saveApiKey } from '../utils/auth';
import { ApiKeyModalProps } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckIcon, LockClosedIcon, InfoCircledIcon, Spinner } from '../components/ui/icons';
import { Dialog, DialogPanel, DialogHeader } from './ui/Dialog';

export default function ApiKeyModal({ isOpen, onClose, onSuccess }: ApiKeyModalProps) {
    const [apiKey, setApiKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [mode, setMode] = useState<'new' | 'manage'>('new');

    useEffect(() => {
        if (isOpen) {
            if (getApiKey()) {
                setMode('manage');
            } else {
                setMode('new');
            }
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

    if (mode === 'manage') {
        return (
            <Dialog isOpen={isOpen} onClose={onClose}>
                <DialogPanel className="max-w-md">
                    <DialogHeader
                        title="API 密钥"
                        subtitle="当前密钥可用于上传和管理图片"
                        tone="green"
                        icon={<CheckIcon className="h-6 w-6" />}
                    />
                    <div className="px-6 py-5">
                        <div className="rounded-xl border border-green-200/80 bg-green-50/80 px-4 py-3 dark:border-green-800/60 dark:bg-green-900/20">
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-sm font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                                已验证密钥
                            </span>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                更换密钥会清除当前密钥，需要重新验证后才能继续使用。
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-700">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            关闭
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                removeApiKey();
                                setMode('new');
                            }}
                            className="btn-primary"
                        >
                            更换密钥
                        </button>
                    </div>
                </DialogPanel>
            </Dialog>
        );
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            <DialogPanel className="max-w-md">
                <DialogHeader
                    title="API 密钥验证"
                    icon={
                        showSuccess
                            ? <CheckIcon className="h-6 w-6" />
                            : <LockClosedIcon className="h-6 w-6" />
                    }
                    tone={showSuccess ? 'green' : 'indigo'}
                />
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 px-6 py-5">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            请输入您的 API 密钥以使用 CattoPic 服务
                        </p>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-slate-700 dark:text-white"
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
                                    <InfoCircledIcon className="mt-0.5 h-5 w-5 shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-700">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            取消
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
                            ) : '验证'}
                        </button>
                    </div>
                </form>
            </DialogPanel>
        </Dialog>
    );
}
