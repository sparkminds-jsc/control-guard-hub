import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RegisterForm {
  fullname: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  
  const password = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (authError) {
        toast({
          title: "Lỗi đăng ký",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (authData.user) {
        // Then create user record in our users table
        const { error: userError } = await supabase
          .from('users')
          .insert([
            {
              email: data.email,
              password: data.password, // Note: In production, don't store plain text passwords
            }
          ]);

        if (userError) {
          console.error("Error creating user record:", userError);
        }

        toast({
          title: "Đăng ký thành công",
          description: "Vui lòng kiểm tra email để xác nhận tài khoản.",
        });
        
        // Redirect to login page
        window.location.href = "/login";
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra, vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Tạo tài khoản</CardTitle>
          <CardDescription className="text-center">
            Điền thông tin để tạo tài khoản mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Họ và tên</Label>
              <Input
                id="fullname"
                type="text"
                placeholder="Nhập họ và tên"
                {...register("fullname", {
                  required: "Họ và tên là bắt buộc",
                  minLength: {
                    value: 2,
                    message: "Họ và tên phải có ít nhất 2 ký tự"
                  }
                })}
              />
              {errors.fullname && (
                <p className="text-sm text-destructive">{errors.fullname.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Nhập số điện thoại"
                {...register("phone", {
                  required: "Số điện thoại là bắt buộc",
                  pattern: {
                    value: /^[0-9]{10,11}$/,
                    message: "Số điện thoại không hợp lệ (10-11 số)"
                  }
                })}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                {...register("email", {
                  required: "Email là bắt buộc",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email không hợp lệ"
                  }
                })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                {...register("password", {
                  required: "Mật khẩu là bắt buộc",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự"
                  }
                })}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                {...register("confirmPassword", {
                  required: "Xác nhận mật khẩu là bắt buộc",
                  validate: (value) =>
                    value === password || "Mật khẩu xác nhận không khớp"
                })}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link 
                to="/login" 
                className="font-medium text-primary hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;