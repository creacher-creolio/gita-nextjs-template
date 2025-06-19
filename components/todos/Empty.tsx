import { CheckSquare } from "lucide-react";

export function Empty() {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No todos yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
                Get started by adding your first todo above. Stay organized and track your progress!
            </p>
        </div>
    );
} 