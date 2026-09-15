import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                <img
                src="/images/task-manager-logo.png"
                alt="Task Manager"
                className="size-10 rounded-lg object-contain"
            />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">Task Manager</span>
            </div>
        </>
    );
}
