import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function Notification({ text, autoDismiss = true, dismissTimeout = 5000 }) {
    const [show, setShow] = useState(true);

    useEffect(() => {
        if (autoDismiss) {
            const timeout = setTimeout(() => setShow(false), dismissTimeout);
            return () => clearTimeout(timeout);
        }
    }, [autoDismiss, dismissTimeout]);

    return (
        <div
            aria-live="assertive"
            className="pointer-events-none fixed bottom-5 right-2 flex w-full items-end px-4 py-6 sm:items-start sm:p-6"
        >
            <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                <Transition
                    show={show}
                    enter="transform transition duration-300 ease-out"
                    enterFrom="translate-y-2 opacity-0"
                    enterTo="translate-y-0 opacity-100"
                    leave="transform transition duration-200 ease-in"
                    leaveFrom="translate-y-0 opacity-100"
                    leaveTo="translate-y-2 opacity-0"
                >
                    <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
                        <div className="p-4">
                            <div className="flex items-start">
                                <div className="shrink-0">
                                    <CheckCircleIcon
                                        aria-hidden="true"
                                        className="h-6 w-6 text-green-400"
                                    />
                                </div>
                                <div className="ml-3 w-0 flex-1 pt-0.5">
                                    <p className="text-sm font-medium text-gray-900">{text}</p>
                                </div>
                                <div className="ml-4 flex shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setShow(false)}
                                        className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        <span className="sr-only">Close</span>
                                        <XMarkIcon aria-hidden="true" className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>
    );
}
