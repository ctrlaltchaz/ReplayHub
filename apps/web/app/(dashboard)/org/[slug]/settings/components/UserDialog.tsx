'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiGet } from '@/lib/api/client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { CreateUserDto, OrgUser, Role, UpdateUserDto } from '../types/settings';

interface UserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: OrgUser | null;
    availableRoles?: Role[];
    onSubmit: (data: CreateUserDto | UpdateUserDto) => void;
    isLoading?: boolean;
}

export function UserDialog({
    open,
    onOpenChange,
    user,
    availableRoles = [],
    onSubmit,
    isLoading,
}: UserDialogProps) {
    const { toast } = useToast();
    const isEditMode = !!user;
    const [userType, setUserType] = useState<'new' | 'existing'>('new');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [isActive, setIsActive] = useState(true);
    const [sendInviteEmail, setSendInviteEmail] = useState(true);

    // Existing global user search state
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ id: string; email: string; name?: string }>>([]);
    const [selectedGlobalUserId, setSelectedGlobalUserId] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        clearErrors,
        setError,
        formState: { errors },
    } = useForm<CreateUserDto>({
        mode: 'onSubmit',
        defaultValues: {
            email: '',
            firstName: '',
            lastName: '',
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                email: user.email,
                firstName: '',
                lastName: '',
                displayName: user.displayName,
            });
            setSelectedRoles(user.roles);
            setIsActive(user.isActive);
        } else {
            reset({
                email: '',
                firstName: '',
                lastName: '',
            });
            setUserType('new');
            setSelectedRoles([]);
            setIsActive(true);
            setSendInviteEmail(true);
            setSearchEmail('');
            setSearchResults([]);
            setSelectedGlobalUserId(null);
        }
    }, [user, reset, open]);

    const handleRoleToggle = (roleName: string) => {
        setSelectedRoles((prev) =>
            prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName]
        );
    };

    const handleSearchGlobalUsers = async () => {
        if (!searchEmail) return;

        try {
            setIsSearching(true);
            const res: any = await apiGet(`/admin/global-users?search=${encodeURIComponent(searchEmail)}`);
            const users = res?.users || [];
            setSearchResults(users.map((u: any) => ({ id: u.id, email: u.email, name: u.name })));
        } catch (err) {
            console.error('Global user search failed', err);
            toast({
                title: 'Error',
                description: 'Failed to search global users',
                variant: 'destructive',
            });
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectGlobalUser = (userId: string, email: string) => {
        setSelectedGlobalUserId(userId);
        setValue('email', email, { shouldValidate: true });
        clearErrors('email');
        toast({
            title: 'Selected',
            description: `Linked to ${email}`,
        });
    };

    const handleFormSubmit = (data: CreateUserDto) => {
        console.log('Form submitted with data:', data);
        console.log('User type:', userType);
        console.log('Is edit mode:', isEditMode);

        // Manual validation for email based on user type
        if (!isEditMode && userType === 'new') {
            if (!data.email || data.email.trim() === '') {
                console.log('Email validation failed - empty');
                setError('email', { type: 'manual', message: 'Email is required' });
                return;
            }
            const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
            if (!emailRegex.test(data.email)) {
                console.log('Email validation failed - invalid format');
                setError('email', { type: 'manual', message: 'Invalid email address' });
                return;
            }
        }

        // For existing users, ensure email is set from selected global user
        if (userType === 'existing' && !selectedGlobalUserId) {
            toast({
                title: 'Error',
                description: 'Please select a global user',
                variant: 'destructive',
            });
            return;
        }

        if (isEditMode) {
            // Only send updated fields for edit
            onSubmit({
                displayName: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email,
                isActive,
            });
        } else {
            // Send all fields for create - backend expects displayName and email
            const displayName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email;

            const createData: any = {
                email: data.email,
                displayName: displayName,
                roles: selectedRoles, // Include selected roles
                isActive: isActive,   // Include active status
                sendInviteEmail: sendInviteEmail, // Include invite email flag
            };

            // If we have a global user ID, add it (for existing user flow)
            if (userType === 'existing' && selectedGlobalUserId) {
                createData.globalUserId = selectedGlobalUserId;
            }

            onSubmit(createData);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" key={open ? 'open' : 'closed'}>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update user information and role assignments.'
                            : 'Add a new user to the organization and assign roles.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {!isEditMode && (
                        <div className="space-y-2">
                            <Label htmlFor="userType">User Type</Label>
                            <Select
                                value={userType}
                                onValueChange={(value: 'new' | 'existing') => {
                                    setUserType(value);
                                    if (value !== 'existing') {
                                        setSelectedGlobalUserId(null);
                                        setSearchEmail('');
                                        setSearchResults([]);
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">Create new user</SelectItem>
                                    <SelectItem value="existing">Assign existing global user</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {userType === 'existing' && !isEditMode && (
                        <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
                            <Label htmlFor="searchEmail">Search Global Users</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="searchEmail"
                                    type="email"
                                    placeholder="user@example.com"
                                    value={searchEmail}
                                    onChange={(e) => setSearchEmail(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSearchGlobalUsers();
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    onClick={handleSearchGlobalUsers}
                                    disabled={isSearching}
                                >
                                    {isSearching ? 'Searching...' : 'Search'}
                                </Button>
                            </div>

                            {searchResults.length === 0 && searchEmail && !isSearching && (
                                <div className="text-sm text-muted-foreground">
                                    No matches found. Try a different email.
                                </div>
                            )}

                            {searchResults.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Select a user:</Label>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {searchResults.map((su) => (
                                            <div
                                                key={su.id}
                                                className="flex items-center justify-between p-3 border rounded bg-background hover:bg-accent transition-colors"
                                            >
                                                <div>
                                                    <div className="font-medium">{su.name || su.email}</div>
                                                    <div className="text-sm text-muted-foreground">{su.email}</div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={selectedGlobalUserId === su.id ? 'default' : 'outline'}
                                                    onClick={() => handleSelectGlobalUser(su.id, su.email)}
                                                >
                                                    {selectedGlobalUserId === su.id ? 'Selected' : 'Select'}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedGlobalUserId && (
                                <div className="text-sm font-medium text-green-600 mt-2">
                                    ✓ Global user selected
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="user@example.com"
                            disabled={isEditMode || (userType === 'existing' && !!selectedGlobalUserId)}
                            onChange={(e) => setValue('email', e.target.value)}
                            defaultValue=""
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                placeholder="John"
                                onChange={(e) => setValue('firstName', e.target.value)}
                                defaultValue=""
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                placeholder="Doe"
                                onChange={(e) => setValue('lastName', e.target.value)}
                                defaultValue=""
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Roles</Label>
                        <div className="border rounded-md p-4 space-y-3 max-h-48 overflow-y-auto">
                            {availableRoles.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-2">
                                    No roles available
                                </p>
                            ) : (
                                availableRoles.map((role) => (
                                    <div key={role.id} className="flex items-start space-x-3">
                                        <Checkbox
                                            id={`role-${role.id}`}
                                            checked={selectedRoles.includes(role.name)}
                                            onCheckedChange={() => handleRoleToggle(role.name)}
                                        />
                                        <div className="flex-1">
                                            <Label
                                                htmlFor={`role-${role.id}`}
                                                className="font-medium cursor-pointer"
                                            >
                                                {role.name}
                                            </Label>
                                            {role.description && (
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    {role.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isActive"
                                checked={isActive}
                                onCheckedChange={(checked) => setIsActive(checked as boolean)}
                            />
                            <Label htmlFor="isActive" className="cursor-pointer font-normal">
                                User is active
                            </Label>
                        </div>

                        {!isEditMode && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="sendInviteEmail"
                                    checked={sendInviteEmail}
                                    onCheckedChange={(checked) =>
                                        setSendInviteEmail(checked as boolean)
                                    }
                                />
                                <Label
                                    htmlFor="sendInviteEmail"
                                    className="cursor-pointer font-normal"
                                >
                                    Send invitation email
                                </Label>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading
                                ? isEditMode
                                    ? 'Updating...'
                                    : 'Creating...'
                                : isEditMode
                                    ? 'Update User'
                                    : 'Create User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
