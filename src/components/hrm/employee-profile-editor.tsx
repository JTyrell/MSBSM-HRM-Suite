"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2, UserCog, Mail, Phone, MapPin, Briefcase, DollarSign, Calendar, Building2, Hash, User } from "lucide-react";
import { useAppStore, type Employee } from "@/store/app";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ============ TYPES ============

interface EmployeeProfileEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | undefined;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  preferredName: string;
  bio: string;
}

// ============ HELPERS ============

function getInitials(firstName: string, lastName: string): string {
  return `${(firstName?.[0] || "").toUpperCase()}${(lastName?.[0] || "").toUpperCase()}`;
}

function getAvatarGradient(id: string): string {
  const gradients = [
    "from-msbm-red to-teal-600",
    "from-teal-500 to-cyan-600",
    "from-cyan-500 to-emerald-600",
    "from-green-500 to-emerald-600",
    "from-teal-600 to-green-500",
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function formatPayRate(payType: string | undefined | null, payRate: number): string {
  if (payType === "salary") {
    return `$${(payRate || 0).toLocaleString()}/yr`;
  }
  return `$${(payRate || 0).toFixed(2)}/hr`;
}

function formatRoleLabel(role: string): string {
  switch (role) {
    case "admin":
      return "Administrator";
    case "hr":
      return "HR Manager";
    case "manager":
      return "Manager";
    case "employee":
      return "Employee";
    default:
      return role.charAt(0).toUpperCase() + role.slice(1);
  }
}

function formatPayType(payType: string | undefined | null): string {
  if (!payType) return "Hourly";
  switch (payType) {
    case "hourly":
      return "Hourly";
    case "salary":
      return "Salary";
    default:
      return payType.charAt(0).toUpperCase() + payType.slice(1);
  }
}

// ============ READ-ONLY FIELD COMPONENT ============

function ReadOnlyField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/80 flex-shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-medium text-foreground">{value || "—"}</p>
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============

export function EmployeeProfileEditor({
  open,
  onOpenChange,
  employee,
}: EmployeeProfileEditorProps) {
  const { setEmployees, employees } = useAppStore();

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    preferredName: "",
    bio: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});

  // Populate form when employee changes or dialog opens
  useEffect(() => {
    if (employee && open) {
      setFormData({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        phone: employee.phone || "",
        address: employee.address || "",
        preferredName: (employee as Employee & { preferredName?: string }).preferredName || "",
        bio: (employee as Employee & { bio?: string }).bio || "",
      });
      setErrors({});
    }
  }, [employee, open]);

  const updateField = useCallback(
    (field: keyof ProfileFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field when user types
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors]
  );

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validate() || !employee) return;

    try {
      setIsSaving(true);

      const res = await fetch("/api/employees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: employee.id,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
          preferredName: formData.preferredName.trim() || null,
          bio: formData.bio.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      const { employee: updatedEmployee } = await res.json();

      // Update the store's employees list
      setEmployees(
        employees.map((emp) =>
          emp.id === employee.id
            ? {
                ...emp,
                ...updatedEmployee,
              }
            : emp
        )
      );

      toast.success("Profile updated successfully!");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }, [formData, employee, validate, employees, setEmployees, onOpenChange]);

  if (!employee) return null;

  const gradientClass = getAvatarGradient(employee.id);
  const initials = getInitials(employee.firstName, employee.lastName);
  const displayName = formData.preferredName
    ? `${formData.preferredName} ${formData.lastName}`
    : `${formData.firstName} ${formData.lastName}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto p-0">
        {/* Header with avatar */}
        <div className="relative">
          {/* Gradient banner */}
          <div className="h-28 bg-gradient-to-br from-msbm-red via-teal-500 to-emerald-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_40%)]" />
          </div>

          {/* Avatar overlapping the banner */}
          <div className="absolute -bottom-10 left-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-msbm-red to-teal-600 flex items-center justify-center border-4 border-background shadow-lg">
              <span className="text-2xl font-bold text-white">
                {initials}
              </span>
            </div>
          </div>
        </div>

        {/* Title section */}
        <div className="pt-12 px-6">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Edit My Profile
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Update your personal information and preferences. Changes will be reflected across the system.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 space-y-6 mt-2">
          {/* ============ Personal Information Section ============ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-msbm-red/10 dark:bg-msbm-red/20">
                <User className="h-3.5 w-3.5 text-msbm-red dark:text-msbm-red-bright" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-medium">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="Enter first name"
                  className={errors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-medium">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Enter last name"
                  className={errors.lastName ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="name@company.com"
                    className={`pl-9 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium">
                  Phone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-medium">
                Address
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Enter your address"
                  rows={2}
                  className="pl-9 resize-none"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* ============ Work Information Section (Read-Only) ============ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-100 dark:bg-teal-900/30">
                <Briefcase className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Work Information</h3>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Read-only
              </Badge>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
              <ReadOnlyField
                icon={Hash}
                label="Employee ID"
                value={employee.employeeId}
              />
              <ReadOnlyField
                icon={Building2}
                label="Department"
                value={employee.department?.name || "Unassigned"}
              />
              <ReadOnlyField
                icon={Briefcase}
                label="Role"
                value={formatRoleLabel(employee.role)}
              />
              <ReadOnlyField
                icon={DollarSign}
                label="Pay Type"
                value={formatPayType(employee.payType)}
              />
              <ReadOnlyField
                icon={DollarSign}
                label="Pay Rate"
                value={formatPayRate(employee.payType, employee.payRate)}
              />
              <ReadOnlyField
                icon={Calendar}
                label="Hire Date"
                value={employee.hireDate ? format(new Date(employee.hireDate), "MMMM d, yyyy") : "—"}
              />
            </div>
          </div>

          <Separator />

          {/* ============ Preferences Section ============ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-900/30">
                <UserCog className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Preferences</h3>
            </div>

            {/* Preferred Name */}
            <div className="space-y-1.5">
              <Label htmlFor="preferredName" className="text-xs font-medium">
                Preferred Name / Nickname
              </Label>
              <Input
                id="preferredName"
                value={formData.preferredName}
                onChange={(e) => updateField("preferredName", e.target.value)}
                placeholder="How would you like to be called?"
              />
              {formData.preferredName && (
                <p className="text-xs text-muted-foreground">
                  Display name: <span className="font-medium text-foreground">{displayName}</span>
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-xs font-medium">
                Bio / About Me
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="Tell us a bit about yourself..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <Separator />

          {/* ============ Footer Actions ============ */}
          <DialogFooter className="flex-row gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-none bg-msbm-red hover:bg-msbm-red/80 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <UserCog className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
