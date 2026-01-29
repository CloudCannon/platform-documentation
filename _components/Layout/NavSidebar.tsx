interface NavSidebarProps {
    children: unknown;
    className?: string;
    teleportTarget?: string;
}

/**
 * NavSidebar - Sidebar wrapper with mobile teleport support
 * 
 * Handles the common pattern of rendering navigation in the desktop sidebar
 * and teleporting a copy to the mobile navigation container.
 */
export default function NavSidebar({ 
    children, 
    className = "",
    teleportTarget = "#mobile-docnav"
}: NavSidebarProps) {
    const asideClass = `l-left ${className}`.trim();
    
    return (
        <aside className={asideClass} x-data="{ more: true }">
            {children}
            <template x-teleport={teleportTarget}>
                {children}
            </template>
        </aside>
    );
}
