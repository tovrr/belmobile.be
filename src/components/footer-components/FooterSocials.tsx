import React from 'react';
import { FacebookIcon, InstagramIcon, YouTubeIcon, TikTokIcon } from '../Icons';

const FooterSocials: React.FC = () => {
    return (
        <div className="flex space-x-4">
            <a href="https://www.facebook.com/Belmobile.be" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-3 rounded-xl hover:bg-electric-indigo hover:scale-110 transition-all border border-white/5" aria-label="Facebook">
                <FacebookIcon className="h-5 w-5 text-white" />
            </a>
            <a href="https://www.instagram.com/belmobile.be" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-3 rounded-xl hover:bg-electric-indigo hover:scale-110 transition-all border border-white/5" aria-label="Instagram">
                <InstagramIcon className="h-5 w-5 text-white" />
            </a>
            <a href="https://www.youtube.com/@belmobile-rachatreparation3659" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-3 rounded-xl hover:bg-electric-indigo hover:scale-110 transition-all border border-white/5" aria-label="YouTube">
                <YouTubeIcon className="h-5 w-5 text-white" />
            </a>
            <a href="https://www.tiktok.com/@belmobile.be" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-3 rounded-xl hover:bg-electric-indigo hover:scale-110 transition-all border border-white/5" aria-label="TikTok">
                <TikTokIcon className="h-5 w-5 text-white" />
            </a>
        </div>
    );
};

export default FooterSocials;
