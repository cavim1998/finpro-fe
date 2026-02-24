"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AdminBypass() {
  return (
    <Card>
      <CardContent className="py-8 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Halaman bypass versi lama sudah tidak dipakai.
        </p>
        <Button asChild variant="outline">
          <Link href="/admin">Kembali ke Dashboard Admin</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default AdminBypass;
