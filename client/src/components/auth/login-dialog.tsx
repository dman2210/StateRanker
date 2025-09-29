import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signInWithPhone, setupRecaptcha } from "@/lib/auth";
import { LogIn, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LoginDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      setOpen(false);
      toast({
        title: "Welcome!",
        description: "Successfully signed in with Google.",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (isSignUp: boolean = false) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast({
          title: "Account created!",
          description: "Successfully created your account.",
        });
      } else {
        await signInWithEmail(email, password);
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
      }
      setOpen(false);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      toast({
        title: isSignUp ? "Sign up failed" : "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSignIn = async () => {
    setIsLoading(true);
    try {
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      const confirmation = await signInWithPhone(phoneNumber, recaptchaVerifier);
      setConfirmationResult(confirmation);
      toast({
        title: "Verification code sent",
        description: "Please enter the code sent to your phone.",
      });
    } catch (error: any) {
      toast({
        title: "Phone sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmationResult) return;
    
    setIsLoading(true);
    try {
      await confirmationResult.confirm(verificationCode);
      setOpen(false);
      setPhoneNumber('');
      setVerificationCode('');
      setConfirmationResult(null);
      toast({
        title: "Welcome!",
        description: "Successfully signed in with phone number.",
      });
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            Sign in to access your personal state ratings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Google Sign In */}
          <Button 
            onClick={handleGoogleSignIn} 
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone">
                <Phone className="w-4 h-4 mr-2" />
                Phone
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleEmailSignIn(false)} 
                  disabled={isLoading || !email || !password}
                  className="flex-1"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => handleEmailSignIn(true)} 
                  disabled={isLoading || !email || !password}
                  variant="outline"
                  className="flex-1"
                >
                  Sign Up
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="phone" className="space-y-4">
              {!confirmationResult ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div id="recaptcha-container"></div>
                  <Button 
                    onClick={handlePhoneSignIn} 
                    disabled={isLoading || !phoneNumber}
                    className="w-full"
                  >
                    Send Verification Code
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                      id="code"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                    />
                  </div>
                  <Button 
                    onClick={handleVerifyCode} 
                    disabled={isLoading || !verificationCode}
                    className="w-full"
                  >
                    Verify Code
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}