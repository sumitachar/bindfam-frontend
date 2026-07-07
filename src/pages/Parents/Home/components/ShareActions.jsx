import React from "react";
import * as Popover from "@radix-ui/react-popover";
import { MoreVertical, X } from "lucide-react";

const ShareActions = ({
  postId,
  isOpen,
  onOpenChange,
  handleShare,
  handleDeletePost,
  isReadOnly,
}) => {
  const WhatsAppIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path d="M16.043 3C9.396 3 4 8.398 4 15.043c0 2.661.742 5.195 2.146 7.418L4 29l6.711-2.082a11.9 11.9 0 0 0 5.332 1.271c6.648 0 12.043-5.396 12.043-12.043C28.086 8.398 22.69 3 16.043 3zm0 22.031a9.91 9.91 0 0 1-5.055-1.402l-0.36-.215-3.98 1.23 1.188-3.859-.235-.371a9.99 9.99 0 0 1-1.543-5.371c0-5.484 4.461-9.949 9.985-9.949a9.9 9.9 0 0 1 9.949 9.949c0 5.52-4.461 9.988-9.949 9.988zm5.484-7.508c-.297-.149-1.766-.871-2.039-.969-.273-.102-.469-.149-.664.148s-.761.969-.934 1.168c-.171.203-.344.223-.64.074-.297-.148-1.25-.461-2.379-1.472-.879-.781-1.469-1.75-1.641-2.043-.172-.297-.019-.457.13-.605.133-.133.297-.344.445-.516.148-.172.199-.297.297-.496.102-.199.051-.371-.023-.52-.074-.148-.664-1.601-.91-2.199-.238-.574-.48-.496-.664-.504l-.57-.012c-.199 0-.52.074-.793.371s-1.04 1.015-1.04 2.476c0 1.461 1.07 2.875 1.222 3.07.148.199 2.109 3.219 5.113 4.512.715.309 1.273.492 1.711.629.719.23 1.371.199 1.891.121.578-.086 1.766-.723 2.016-1.426.25-.699.25-1.297.176-1.426-.07-.133-.27-.199-.57-.348z" />
    </svg>
  );

  const shareOptions = [
    { platform: "Facebook", icon: "logo_facebook", bg: "bg-blue-600 hover:bg-blue-700 text-white" },
    { platform: "Instagram", icon: "logo_instagram", bg: "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 text-white" },
    { platform: "Twitter", icon: "logo_twitter", bg: "bg-sky-500 hover:bg-sky-600 text-white" },
    { platform: "WhatsApp", customIcon: <WhatsAppIcon />, bg: "bg-green-500 hover:bg-green-600 text-white" },
    { platform: "Copy Link", icon: "link", bg: "bg-gray-600 hover:bg-gray-700 text-white" },
  ];

  return (
    <Popover.Root open={isOpen} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button
          className="p-2.5 hover:bg-primary/10 rounded-full transition-all duration-200 group"
          disabled={isReadOnly}
        >
          <MoreVertical className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          className="z-50 glass-card p-4 rounded-xl w-56 shadow-2xl border border-primary/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Share Memory</h3>
              <Popover.Close className="p-1.5 hover:bg-input rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </Popover.Close>
            </div>

            <div className="space-y-2">
              {shareOptions.map((option) => (
                <button
                  key={option.platform}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(option.platform);
                    onOpenChange(false);
                  }}
                  className={`flex items-center space-x-3 w-full p-3 rounded-lg text-sm font-medium ${option.bg} transition-all transform hover:scale-105 shadow-md`}
                >
                  {option.customIcon || (
                    <svg className="w-5 h-5">
                      <use href={`/icons.svg#${option.icon}`} />
                    </svg>
                  )}
                  <span>{option.platform}</span>
                </button>
              ))}

              {!isReadOnly && handleDeletePost && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePost(postId);
                    onOpenChange(false);
                  }}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-all transform hover:scale-105 shadow-md"
                >
                  <svg className="w-5 h-5">
                    <use href="/icons.svg#trash" />
                  </svg>
                  <span>Delete Memory</span>
                </button>
              )}
            </div>
          </div>

          <Popover.Arrow className="fill-primary/30" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default ShareActions;