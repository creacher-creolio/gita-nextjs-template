import { CheckSquare } from "lucide-react";

export function Empty() {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckSquare className="text-muted-foreground/50 mb-4 h-12 w-12" />
            <h3 className="text-muted-foreground mb-2 text-lg font-medium">No todos yet</h3>
            <p className="text-muted-foreground max-w-sm text-sm">
                Get started by adding your first todo above. Stay organized and track your progress!
            </p>
        </div>
    );
}
