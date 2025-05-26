import { IconCirclePlusFilled, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  listReportsReportGet,
  listAlertsAlertGet,
  ReportPublic,
  AlertPublic,
  UserPublic,
  UserRole,
  createUserUserPost,
  listUsersUserGet,
} from "@/app/client/";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "@/components/ui/toast";

interface CreateUserDialogProps {
  initialUserId?: number;
  trigger?: React.ReactNode;
}

export function CreateUserDialog({
  initialUserId,
  trigger,
}: CreateUserDialogProps) {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<UserRole>();
  const [emailError, setEmailError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserPublic[]>([]);
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    async function fetchData() {
      if (dataFetchedRef.current) return;

      try {
        const [{ data: users }] = await Promise.all([listUsersUserGet()]);

        if (users) {
          setUsers(users.data);
          dataFetchedRef.current = true;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  const handleUserCreate = async () => {
    try {
      await createUserUserPost({
        body: {
          user_email: userEmail,
          user_name: userName,
          user_role: userRole,
        },
      });

      toast({ message: "User added successfully", type: "success" });
      handleClear();
    } catch (error) {
      console.error("User creation failed", error);
      toast({ message: "Failed to add user", type: "error" });
    }
  };

  const handleClear = () => {
    setUserName("");
    setUserEmail("");
    setUserRole(userRole);
    setEmailError(null);
  };

  const handleEmailChange = useCallback(
    (value: string) => {
      const emailExist = users.some((r) => r.user_email === value);

      setUserEmail(value);

      if (emailExist) {
        setEmailError("This email is already in use");
      } else {
        setEmailError(null);
        setUserEmail(value);
      }
    },
    [users]
  );

  useEffect(() => {
    if (initialUserId) {
      handleEmailChange(initialUserId.toString());
    }
  }, [handleEmailChange, initialUserId]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="sm" className="cursor-pointer">
            <IconCheck className="mr-1" />
            Add User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Fill the details to add a new user.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="zoneId" className="text-right">
              User name
            </Label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="alertId" className="text-right">
              User email
            </Label>
            <Input
              id="userEmail"
              value={userEmail}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={cn(
                "col-span-3",
                emailError && "border-red-500 ring-red-500"
              )}
            />
            {emailError && (
              <div className="col-start-2 col-span-3 text-sm text-red-500 text-left pr-1">
                {emailError}
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="damage" className="text-right">
              User role
            </Label>
            <Select
              value={userRole}
              onValueChange={(value) => setUserRole(value as UserRole)}
            >
              <SelectTrigger
                id="userRole"
                className="col-span-3 cursor-pointer w-full"
              >
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin" className="cursor-pointer text-left">
                  Admin
                </SelectItem>
                <SelectItem value="control" className="cursor-pointer">
                  Control
                </SelectItem>
                <SelectItem value="operator" className="cursor-pointer">
                  Operator
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            variant="outline"
            onClick={handleClear}
            className="cursor-pointer"
          >
            Clear
          </Button>
          <Button
            type="submit"
            onClick={handleUserCreate}
            className="cursor-pointer"
            disabled={
              !!emailError || userName === "" || userEmail === "" || !userRole
            }
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
