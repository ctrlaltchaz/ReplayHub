interface ToastProps {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
}

export function useToast() {
    return {
        toast: ({ title, description, variant = 'default' }: ToastProps) => {
            const message = description ? `${title}: ${description}` : title;

            // Simple browser alert for now - can be enhanced later with proper toast system
            if (variant === 'destructive') {
                console.error(message);
                alert(`Error: ${message}`);
            } else {
                console.log(message);
                alert(message);
            }
        }
    };
}