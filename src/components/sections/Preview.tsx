import { SHORT_URL } from '@/apis/config';
import { Page, PageLink } from '@/types';
import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

interface PreviewProps {
    title: string;
    configuration: Page['configuration'];
    links?: PageLink[];
    previewIcon?: boolean;
}
export const socialIcons = {
    fb: <FaFacebook className="w-6 h-6 dark:text-gray-300" />,
    tiktok: <FaTiktok className="w-6 h-6 dark:text-gray-300" />,
    ig: <FaInstagram className="w-6 h-6 dark:text-gray-300" />,
    linkedin: <FaLinkedin className="w-6 h-6 dark:text-gray-300" />,
    x: <FaXTwitter className="w-6 h-6 dark:text-gray-300" />,
};
const Preview: React.FC<PreviewProps> = ({
    title,
    links,
    configuration,
    previewIcon,
}) => {
    const {
        background,
        textColor,
        button: buttonStyle,
        fontFamily,
        social,
    } = configuration;
    const baseClass = `py-8 w-[298px] p-6 rounded-3xl overflow-scroll ${previewIcon ? 'h-[500px]' : 'h-[558px]'
        }`;

    return (
        <div
            style={{
                background: background,
                color: textColor,
                fontFamily: fontFamily,
            }}
            className={baseClass}
        >
            <div className="flex items-center flex-col gap-4">
                <img
                    className="w-24 rounded-full"
                    src="https://media.licdn.com/dms/image/v2/D4E03AQGxSpkUziRtJw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1670734923885?e=1741824000&v=beta&t=ttG8r70zeBc8kdVNCnXZHENQghBbaGs-zsmtuqD419Q"
                />
                <h1 className="text-2xl mb-4 font-bold text-center">{title}</h1>
            </div>
            {links && (
                <div className="mt-20 space-y-4 grid grid-cols-1">
                    {links.map((button) => (
                        <a
                            key={button.id}
                            href={button.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                backgroundColor: button.color,
                                color: textColor,
                            }}
                            className={`inline-block px-4 py-2 font-bold text-center ${buttonStyle !== 'squared' ? buttonStyle : ''
                                }`}
                        >
                            {button.label}
                        </a>
                    ))}
                </div>
            )}
            {previewIcon && (
                <div className="mt-20 space-y-4 grid grid-cols-1 font-bold text-center">
                    <a
                        href="#"
                        className={`pointer-events-none inline-block px-4 py-2 ${buttonStyle !== 'squared' ? buttonStyle : ''
                            }`}
                    >
                        {SHORT_URL}
                    </a>
                    <a
                        href="#"
                        className={`pointer-events-none inline-block px-4 py-2 ${buttonStyle !== 'squared' ? buttonStyle : ''
                            }`}
                    >
                        {SHORT_URL}
                    </a>
                    <a
                        href="#"
                        className={`pointer-events-none inline-block px-4 py-2 ${buttonStyle !== 'squared' ? buttonStyle : ''
                            }`}
                    >
                        {SHORT_URL}
                    </a>
                </div>
            )}
            {!previewIcon && (
                <div className="flex gap-4 mt-6 content-center justify-center">
                    {Object.entries(social).map(([key, link]) =>
                        link ? (
                            <a
                                key={key}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white hover:scale-105"
                            >
                                {socialIcons[key as keyof typeof socialIcons]}
                            </a>
                        ) : null
                    )}
                </div>
            )}
        </div>
    );
};

export default Preview;
