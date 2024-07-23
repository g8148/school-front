import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { z } from "zod";
import { useRevalidator } from "@remix-run/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { api_url } from "@/app/root";

export const Payment = z.object({
  id: z.number(),
  className: z.string(),
  totalEntries: z.number(),
  soldEntries: z.number(),
  createAt: z.string(),
});

export const columns: ColumnDef<z.infer<typeof Payment>>[] = [
  // {
  //   accessorKey: "id",
  //   header: "Id",
  // },
  {
    accessorKey: "className",
    header: "Nome do Evento",
  },
  {
    accessorKey: "totalEntries",
    header: "Total de Ingressos",
  },
  {
    accessorKey: "soldEntries",
    header: "Ingressos vendidos",
  },
  // {
  //   accessorKey: "createAt",
  //   header: "Criado em",
  //   cell: ({ cell }) => {
  //     const item = cell.getValue<string>();
  //     const [year, month, day] = item.split("-");
  //     return `${day}/${month}/${year}`;
  //   },
  // },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      const revalidator = useRevalidator();
      const [openAlert, setOpenAlert] = useState(false);
      const [open, setOpen] = useState(false);

      const formSchema = z.object({
        className: z
          .string()
          .refine((val) => val.length >= 2 || val.length === 0, {
            message:
              "O nome do Evento deve ter pelo menos 2 caracteres ou pode estar vazio.",
          }),
        totalEntries: z
          .number()
          .min(0, { message: "O valor não pode ser negativo" }),
        soldEntries: z
          .number()
          .min(0, { message: "O valor não pode ser negativo" }),
      });

      const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          className: "",
          totalEntries: item.totalEntries,
          soldEntries: item.soldEntries,
        },
      });

      async function updateClass(values: z.infer<typeof formSchema>) {
        if (values.soldEntries > values.totalEntries) {
          toast.error(
            "O valor de ingressos vendidos não pode ser maior que o total de ingressos.",
          );
          return;
        }

        setOpen(false);

        const response = await fetch(
          `http://localhost:3333/api/events/classes/${item.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              className: values.className ? values.className : item.className,
              totalEntries: values.totalEntries,
              soldEntries: values.soldEntries,
            }),
          },
        );

        if (!response.ok) {
          const errorMessage = await response.text();
          toast.error(errorMessage);
          return;
        }
        if (response.ok) {
          toast.success("Informações atualizadas com sucesso");
          revalidator.revalidate();
        }
      }

      async function deleteItem(id: number) {
        const response = await fetch(
          `http://localhost:3333/api/events/classes/${id}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          toast.error("Erro ao deletar a turma");
          return;
        }
        if (response.ok) {
          toast.success("Turma deletada com sucesso");
          revalidator.revalidate();
        }
      }

      return (
        <>
          <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
            <Dialog open={open} onOpenChange={setOpen}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DialogTrigger asChild>
                    <DropdownMenuItem>Editar</DropdownMenuItem>
                  </DialogTrigger>

                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem>Deletar</DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent aria-describedby="description">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Você tem certeza dessa ação?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita e irá deletar todos os dados
                    relacionados a esse item.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600"
                    onClick={async () => {
                      await deleteItem(item.id);
                      setOpenAlert(false);
                    }}
                  >
                    Deletar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>

              <DialogContent
                aria-describedby="description"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <DialogHeader>
                  <DialogTitle>Editando Turma: {item.className}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(updateClass)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="className"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Evento</FormLabel>
                          <FormControl>
                            <Input placeholder={item.className} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="totalEntries"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total de Ingressos</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value, 10))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="soldEntries"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ingressos Vendidos</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value, 10))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Salvar</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </AlertDialog>
        </>
      );
    },
  },
];
