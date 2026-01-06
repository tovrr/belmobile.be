export const metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function PortalRootLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="antialiased">
            {children}
        </div>
    );
}
