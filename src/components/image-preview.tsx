import type React from "react"
import { tv, type VariantProps } from "tailwind-variants"

export const imagePreviewVariants = tv({
    base: `rounded-lg overflow-hidden`,
});

export const imagePreviewImageVariants = tv({
    base: `w-full h-full object-cover`
})

interface ImagePreviewProps extends 
React.ComponentProps<"img">,
VariantProps<typeof imagePreviewImageVariants> {
    imageClassName?: string;
}

export default function ImagePreview({
    imageClassName,
    className,
    ...props
}: ImagePreviewProps) {
    return (
        <div className={imagePreviewVariants({className})}>
            <img
                className={imagePreviewImageVariants({className: imageClassName})}
                {...props}
            />
        </div>
    )
}