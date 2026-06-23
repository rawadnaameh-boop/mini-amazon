"use client";

export default function ProductError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div>
            <p>Something went wrong while loading this product.</p>
            <button onClick={() => reset()}>Try again</button>
        </div>
    );
}