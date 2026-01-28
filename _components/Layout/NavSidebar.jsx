/**
 * NavSidebar - Sidebar wrapper with mobile teleport support
 * 
 * Handles the common pattern of rendering navigation in the desktop sidebar
 * and teleporting a copy to the mobile navigation container.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The navigation component(s) to render
 * @param {string} props.className - Additional CSS classes for the aside element
 * @param {string} props.teleportTarget - Target ID for mobile teleport (default: "#mobile-docnav")
 */
export default function NavSidebar({ 
    children, 
    className = "",
    teleportTarget = "#mobile-docnav"
}) {
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
