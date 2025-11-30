import { SHORT_URL } from '@/apis/config';
import { Page, PageLink } from '@/types';
import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

interface PreviewProps {
    title: string;
    description?: string;
    content: Page['content'];
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
    description,
    links,
    content,
    previewIcon,
}) => {
    const {
        backgroundType,
        backgroundColor,
        gradientStart,
        gradientEnd,
        gradientDirection,
        buttonColor,
        textColor,
        button: buttonStyle,
        fontFamily,
        social,
        profileImage,
    } = content;
    const baseClass = `py-8 w-[298px] p-6 overflow-y-scroll scrollbar-hidden rounded-3xl ${previewIcon ? 'h-[500px]' : 'h-[558px]'
        }`;

    const backgroundStyle = backgroundType === 'gradient'
        ? `linear-gradient(${gradientDirection || 'to right'}, ${gradientStart || '#ffffff'}, ${gradientEnd || '#000000'})`
        : backgroundColor || '#ffffff';

    return (
        <div
            style={{
                background: backgroundStyle,
                fontFamily: fontFamily,
            }}
            className={baseClass}
        >
            <div className="flex items-center flex-col gap-4" style={{
                color: textColor
            }}>
                {profileImage && (
                    <img
                        className="w-24 h-24 rounded-full object-cover"
                        src={profileImage}
                        alt="Profile"
                    />
                )}
                <h1 className="text-2xl mb-4 font-bold text-center break-all">{title}</h1>
                {description && <h2 className="text-base -mt-6 mb-4 text-center break-all">{description}</h2>}
            </div>
            {!previewIcon && (
                <div className="flex gap-4 mt-6 content-center justify-center">
                    {social && Object.entries(social).map(([key, link]) =>
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
            {links && (
                <div className="mt-10 space-y-4 grid grid-cols-1">
                    {links.map((button) => (
                        <a
                            key={button.id}
                            href={button.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={button.description || button.label}
                            style={{
                                backgroundColor: button.color,
                                color: buttonColor,
                            }}
                            className={`inline-block px-4 py-2 font-bold text-center ${buttonStyle !== 'squared' ? buttonStyle : ''}`}
                        >
                            {button.label}
                        </a>
                    ))}
                </div>
            )}
            {previewIcon && (
                <div className="mt-20 space-y-4 grid grid-cols-1 font-bold text-center">
                    {[1, 2, 3].map((_, index) => (
                        <a
                            key={index}
                            href="#"
                            className={`pointer-events-none inline-block px-4 py-2 ${buttonStyle !== 'squared' ? buttonStyle : ''}`}
                        >
                            {SHORT_URL}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Preview;
