"use client"

import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

// Hook to detect mobile devices
function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState(false)

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return isMobile
}

// Native select for mobile
interface NativeSelectProps {
    value?: string
    onValueChange?: (value: string) => void
    disabled?: boolean
    children: React.ReactNode
    placeholder?: string
    required?: boolean
}

function NativeSelectWrapper({ value, onValueChange, disabled, children, placeholder, required }: NativeSelectProps) {
    // Extract options from children
    const options: Array<{ value: string; label: string; disabled?: boolean }> = []

    const extractTextContent = (node: React.ReactNode): string => {
        if (typeof node === 'string') return node
        if (typeof node === 'number') return String(node)
        if (Array.isArray(node)) return node.map(extractTextContent).join('')
        if (React.isValidElement(node)) {
            return extractTextContent(node.props.children)
        }
        return ''
    }

    const extractOptions = (node: React.ReactNode): void => {
        React.Children.forEach(node, (child) => {
            if (React.isValidElement(child)) {
                // Check if it's a SelectItem
                if (child.type === SelectItem) {
                    const label = extractTextContent(child.props.children)
                    options.push({
                        value: child.props.value,
                        label: label || child.props.value,
                        disabled: child.props.disabled
                    })
                }
                // Recursively check children (for SelectContent, SelectGroup, etc.)
                else if (child.props?.children) {
                    extractOptions(child.props.children)
                }
            }
        })
    }

    extractOptions(children)

    return (
        <div className="relative">
            <select
                value={value || ''}
                onChange={(e) => onValueChange?.(e.target.value)}
                disabled={disabled}
                required={required}
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8"
                )}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
        </div>
    )
}

// Main Select component that switches between native and Radix
interface SelectProps {
    value?: string
    onValueChange?: (value: string) => void
    disabled?: boolean
    children: React.ReactNode
    defaultValue?: string
    name?: string
    required?: boolean
}

function Select({ value, onValueChange, disabled, children, defaultValue, name, required }: SelectProps) {
    const isMobile = useIsMobile()
    const [placeholder, setPlaceholder] = React.useState<string>()

    // Extract placeholder from SelectValue if present
    React.useEffect(() => {
        React.Children.forEach(children, (child) => {
            if (React.isValidElement(child) && child.type === SelectTrigger) {
                React.Children.forEach(child.props.children, (triggerChild: any) => {
                    if (React.isValidElement(triggerChild) && triggerChild.type === SelectValue) {
                        setPlaceholder((triggerChild.props as any)?.placeholder)
                    }
                })
            }
        })
    }, [children])

    if (isMobile) {
        return (
            <NativeSelectWrapper
                value={value || defaultValue}
                onValueChange={onValueChange}
                disabled={disabled}
                placeholder={placeholder}
                required={required}
            >
                {children}
            </NativeSelectWrapper>
        )
    }

    // Desktop: use Radix Select
    return (
        <SelectPrimitive.Root
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            defaultValue={defaultValue}
            name={name}
            required={required}
        >
            {children}
        </SelectPrimitive.Root>
    )
}

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            className
        )}
        {...props}
    >
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
        ref={ref}
        className={cn(
            "flex cursor-default items-center justify-center py-1",
            className
        )}
        {...props}
    >
        <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
        ref={ref}
        className={cn(
            "flex cursor-default items-center justify-center py-1",
            className
        )}
        {...props}
    >
        <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
    SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            className={cn(
                "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                // Mobile/tablet responsive: aggressive constraints
                "!max-w-[calc(100vw-2rem)] !max-h-[50vh]",
                "lg:!max-w-none lg:!max-h-96",
                // Center on mobile if needed
                "left-[50%] !-translate-x-[50%]",
                "lg:left-auto lg:!translate-x-0",
                position === "popper" &&
                "lg:data-[side=bottom]:translate-y-1 lg:data-[side=left]:-translate-x-1 lg:data-[side=right]:translate-x-1 lg:data-[side=top]:-translate-y-1",
                className
            )}
            position={position}
            {...props}
        >
            <SelectScrollUpButton />
            <SelectPrimitive.Viewport
                className={cn(
                    "p-1",
                    // Enable smooth scrolling on mobile with momentum
                    "overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]",
                    "max-h-[50vh]",
                    position === "popper" &&
                    "w-full min-w-[var(--radix-select-trigger-width)]"
                )}
            >
                {children}
            </SelectPrimitive.Viewport>
            <SelectScrollDownButton />
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Label
        ref={ref}
        className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
        {...props}
    />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            // Larger touch targets on mobile
            "lg:py-1.5 py-3 min-h-[44px]",
            className
        )}
        {...props}
    >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <SelectPrimitive.ItemIndicator>
                <Check className="h-4 w-4" />
            </SelectPrimitive.ItemIndicator>
        </span>

        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-muted", className)}
        {...props}
    />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
    Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue
}

