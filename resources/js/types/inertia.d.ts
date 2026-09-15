import '@inertiajs/core';

declare module '@inertiajs/core' {
    interface PageProps {
        name: string;

        quote: {
            message: string;
            author: string;
        };

        auth: {
            user: {
                id: number;
                name: string;
                email: string;
            } | null;
        };

        flash: {
            success?: string;
            error?: string;
        };
    }
}
