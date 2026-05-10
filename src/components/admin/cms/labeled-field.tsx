"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface BaseProps {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

interface InputFieldProps extends BaseProps {
  kind?: "input";
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  type?: "text" | "url" | "email" | "number";
}

interface TextareaFieldProps extends BaseProps {
  kind: "textarea";
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  rows?: number;
}

interface ColorFieldProps extends BaseProps {
  kind: "color";
  value: string;
  onChange: (next: string) => void;
}

type Props = InputFieldProps | TextareaFieldProps | ColorFieldProps;

export function LabeledField(props: Props) {
  const id =
    props.id ??
    `field-${props.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className={cn("flex flex-col gap-1.5", props.className)}>
      <Label htmlFor={id}>
        {props.label}
        {props.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {props.kind === "textarea" ? (
        <Textarea
          id={id}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          rows={props.rows ?? 3}
        />
      ) : props.kind === "color" ? (
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="color"
            value={props.value || "#000000"}
            onChange={(e) => props.onChange(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded-md border border-input bg-background"
          />
          <Input
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder="#000000"
            className="font-mono text-sm"
          />
        </div>
      ) : (
        <Input
          id={id}
          type={props.type ?? "text"}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
        />
      )}
      {props.hint && (
        <p className="text-xs text-muted-foreground">{props.hint}</p>
      )}
    </div>
  );
}
