import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink, Layout } from "lucide-react";

interface ProductSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  productData: {
    name: string;
    generated_link: string;
    productId: string;
  };
  onGoToDashboard: () => void;
}

export function ProductSuccessModal({
  isOpen,
  onClose,
  productData,
  onGoToDashboard,
}: ProductSuccessModalProps) {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productData.generated_link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleViewSite = () => {
    window.open(productData.generated_link, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-center">
            Product Created Successfully!
          </DialogTitle>
          <DialogDescription className="text-center">
            Your product "{productData.name}" has been created and is now live.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Link */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">
              Product Link
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={productData.generated_link}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="px-3"
              >
                {linkCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-2">
            <Button onClick={handleViewSite} className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Live Site
            </Button>

            <Button
              variant="outline"
              onClick={onGoToDashboard}
              className="w-full"
            >
              <Layout className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            You can always access your product from the dashboard
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
