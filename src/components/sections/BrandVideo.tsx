'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { PlayIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import FadeIn from '../ui/FadeIn';

const BrandVideo: React.FC = () => {
    const { t } = useLanguage();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Placeholder until the real video is produced using the script
    const videoSrc = "/videos/Belmobile_corporate_video_2026.mp4";
    const posterSrc = "/images/microsoldering-lab-motherboard-repair-brussels.webp";

    const togglePlay = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            // Set volume to 15% - User requested it to be much quieter
            videoRef.current.volume = 0.15;
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        if (!isMuted) {
            // Muting
        } else {
            // Unmuting - ensure volume is very low
            videoRef.current.volume = 0.15;
        }
        setIsMuted(!isMuted);
    };

    // Set initial volume when component mounts
    React.useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = 0.15;
        }
    }, []);

    return (
        <section className="py-20 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4 max-w-6xl">

                <div className="text-center mb-12">
                    <span className="inline-block py-1 px-3 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold mb-4 uppercase tracking-widest">
                        {t('video_watch_story')}
                    </span>
                    <h2 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 break-words">
                        {t('video_section_title') || '30 Minutes. Lifetime Guarantee.'}
                    </h2>
                    <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {t('video_section_desc') || "See how our certified technicians in Brussels bring your dead devices back to life using state-of-the-art microsoldering labs."}
                    </p>
                </div>

                <FadeIn delay={0.2}>
                    <div
                        className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 group cursor-pointer bg-black"
                        onClick={togglePlay}
                    >
                        {/* Video Element */}
                        <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            poster={posterSrc}
                            playsInline
                            loop
                            muted={isMuted}
                            onPlay={(e) => {
                                // Force volume to 15% on play to prevent blasting
                                e.currentTarget.volume = 0.15;
                            }}
                        // On the real site, you'd integrate the actual source here
                        // src={videoSrc} 
                        >
                            <source src={videoSrc} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>

                        {/* Overlay: Only visible when NOT playing or paused */}
                        {!isPlaying && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all group-hover:bg-black/30">
                                {/* Play Button with Pulse Effect */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                                    <div className="relative w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                        <PlayIcon className="w-10 h-10 text-white ml-2" />
                                    </div>
                                </div>

                                <div className="absolute bottom-8 left-8 text-white text-left">
                                    <div className="font-bold text-xl">{t('video_overlay_title')}</div>
                                    <div className="text-sm opacity-80">{t('video_overlay_subtitle')}</div>
                                </div>
                            </div>
                        )}

                        {/* Controls Overlay: Visible when playing */}
                        {isPlaying && (
                            <div className="absolute bottom-6 right-6 flex gap-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                                <button
                                    onClick={toggleMute}
                                    className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors"
                                >
                                    {isMuted ? <SpeakerXMarkIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        )}
                    </div>
                </FadeIn>

                {/* Trust Indicators below video */}
                <div className="mt-16 flex flex-col items-center">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-8">
                        {t('certified_and_recognized_by') || 'Certified and Recognized By'}
                    </p>
                    <div className="grid grid-cols-2 md:flex md:flex-row justify-center items-center gap-6 md:gap-16 opacity-50 dark:opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="flex flex-col items-center group">
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">Google</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full mt-1">4.9/5 Rating</span>
                        </div>
                        <div className="flex flex-col items-center group">
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">Trustpilot</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full mt-1">Excellent</span>
                        </div>
                        <div className="flex flex-col items-center group">
                            <span className="text-2xl font-black text-red-600 dark:text-red-500 tracking-tighter">Test-Achats</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full mt-1">Certified</span>
                        </div>
                        <div className="flex flex-col items-center group">
                            <span className="text-2xl font-black text-slate-800 dark:text-slate-200 tracking-tighter">Repair.org</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1">Member</span>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default BrandVideo;
