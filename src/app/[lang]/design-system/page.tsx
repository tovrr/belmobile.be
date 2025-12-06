'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { HomeIcon, UserIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function DesignSystemPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-deep-space text-gray-900 dark:text-white p-8">
            <div className="max-w-4xl mx-auto space-y-12">
                <header>
                    <h1 className="text-4xl font-bold mb-4">Belmobile Design System</h1>
                    <p className="text-lg text-gray-500">
                        Unified component library using Tailwind V4 semantic tokens.
                    </p>
                </header>

                {/* Colors Section */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold border-b pb-2 border-gray-200 dark:border-white/10">Colors</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ColorCard name="Primary" className="bg-primary text-white" />
                        <ColorCard name="Secondary" className="bg-secondary text-white" />
                        <ColorCard name="Accent" className="bg-accent text-gray-900" />
                        <ColorCard name="Surface Dark" className="bg-surface-dark text-white border border-gray-700" />
                    </div>
                </section>

                {/* Buttons Section */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold border-b pb-2 border-gray-200 dark:border-white/10">Buttons</h2>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button>Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="danger">Danger</Button>
                        <Button isLoading>Loading</Button>
                        <Button disabled>Disabled</Button>
                        <Button icon={<HomeIcon className="h-5 w-5" />}>With Icon</Button>
                    </div>
                </section>

                {/* Inputs Section */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold border-b pb-2 border-gray-200 dark:border-white/10">Inputs & Selects</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Default Input"
                            placeholder="Type something..."
                        />
                        <Input
                            label="With Error"
                            placeholder="Type something..."
                            error="This field is required"
                        />
                        <Input
                            label="With Description"
                            placeholder="Type something..."
                            description="Helper text goes here"
                        />
                        <Select
                            label="Native Select"
                            options={[
                                { value: '1', label: 'Option 1' },
                                { value: '2', label: 'Option 2' },
                                { value: '3', label: 'Option 3' },
                            ]}
                        />
                        <Textarea
                            label="Text Area"
                            placeholder="Type a message..."
                            description="Resizable text area component"
                        />
                    </div>
                </section>

                {/* Cards Section */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold border-b pb-2 border-gray-200 dark:border-white/10">Surfaces / Cards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-3xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10 shadow-xl">
                            <h3 className="text-xl font-bold mb-2">Default Card</h3>
                            <p className="text-gray-500">Using `bg-surface-light` / `bg-surface-dark`</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 shadow-xl">
                            <h3 className="text-xl font-bold mb-2">Glass Card</h3>
                            <p className="text-gray-500">Using backdrop blur utility</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function ColorCard({ name, className }: { name: string, className: string }) {
    return (
        <div className={`p-4 rounded-xl flex flex-col justify-between h-24 shadow-sm ${className}`}>
            <span className="font-bold">{name}</span>
        </div>
    );
}
