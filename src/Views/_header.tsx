"use client";

import { useState, useEffect } from "react";
import type { ComponentType, SVGProps } from "react";
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/20/solid";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState("Eu");

  useEffect(() => {
    async function fetchUserName() {
      if (!user) return;

      try {
        const { data } = await supabase
          .from("users")
          .select("first_name")
          .eq("id", user.id)
          .single();

        if (data?.first_name) {
          setDisplayName(data.first_name);
        }
      } catch {
        console.error("Erro ao carregar");
      }
    }

    fetchUserName();
  }, [user]);

  type MenuItem = {
    name: string;
    description?: string;
    href?: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    onClick?: () => void;
  };

  const products: MenuItem[] = [
    {
      name: "Meu perfil",
      description: "Ver meu perfil",
      href: user ? `/user/${user.id}` : "#",
      icon: UserCircleIcon,
    },
  ];
  const callsToAction: MenuItem[] = [
    { name: "Configurações", href: "/cadastro", icon: Cog6ToothIcon },
    {
      name: "Sair",
      href: "#",
      icon: ArrowRightOnRectangleIcon,
      onClick: () => {
        logout();
        setMobileMenuOpen(false);
      },
    },
  ];

  return (
    <header className="bg-gray-900 border-b border-white/5">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <a href="/lista" className="-m-1.5 p-1.5">
            <span className="sr-only">viveo-teste</span>
            <img
              alt=""
              src="../../public/logo-fl-w.svg"
              className="h-8 w-auto"
            />
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
          >
            <span className="sr-only">Abrir menu principal</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
        <PopoverGroup className="hidden lg:flex lg:gap-x-12">
          <a href="/lista" className="text-sm/6 font-semibold text-white">
            Feed
          </a>
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm/6 font-semibold text-white outline-none">
              {displayName}
              <ChevronDownIcon
                aria-hidden="true"
                className="size-5 flex-none text-gray-500"
              />
            </PopoverButton>

            <PopoverPanel
              transition
              className="-ml-32 absolute left-1/2 z-10 mt-3 w-screen max-w-md -translate-x-1/2 overflow-hidden rounded-3xl bg-gray-800 outline-1 -outline-offset-1 outline-white/10 transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
            >
              <div className="p-4">
                {products.map((item) => (
                  <div
                    key={item.name}
                    className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-white/5"
                  >
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-700/50 group-hover:bg-gray-700">
                      <item.icon
                        aria-hidden="true"
                        className="size-6 text-gray-400 group-hover:text-white"
                      />
                    </div>
                    <div className="flex-auto">
                      <a
                        href={item.href}
                        className="block font-semibold text-white"
                      >
                        {item.name}
                        <span className="absolute inset-0" />
                      </a>
                      <p className="mt-1 text-gray-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 divide-x divide-white/10 bg-gray-700/50">
                {callsToAction.map((item) => (
                  <button
                    key={item.name}
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault();
                        item.onClick();
                      } else if (item.href && item.href !== "#") {
                        window.location.href = item.href;
                      }
                    }}
                    className="flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold text-white hover:bg-gray-700/50 cursor-pointer w-full"
                  >
                    <item.icon
                      aria-hidden="true"
                      className="size-5 flex-none text-gray-500"
                    />
                    {item.name}
                  </button>
                ))}
              </div>
            </PopoverPanel>
          </Popover>
        </PopoverGroup>
      </nav>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
          <div className="flex items-center justify-between">
            <a href="/lista" className="-m-1.5 p-1.5">
              <span className="sr-only">viveo-teste</span>
              <img
                alt=""
                src="../../public/logo-fl-w.svg"
                className="h-8 w-auto"
              />
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-400"
            >
              <span className="sr-only">Fechar menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-white/10">
              <div className="space-y-2 py-6">
                <a
                  href="/lista"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
                >
                  Feed
                </a>
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base/7 font-semibold text-white hover:bg-white/5">
                    {displayName}
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="size-5 flex-none group-data-open:rotate-180"
                    />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {[...products, ...callsToAction].map((item) => (
                      <button
                        key={item.name}
                        onClick={(e) => {
                          if (item.onClick) {
                            e.preventDefault();
                            item.onClick();
                          } else if (item.href && item.href !== "#") {
                            window.location.href = item.href;
                          }
                        }}
                        className="block w-full text-left rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-white hover:bg-white/5"
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="h-5 w-5 text-gray-400" />
                          {item.name}
                        </div>
                      </button>
                    ))}
                  </DisclosurePanel>
                </Disclosure>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
