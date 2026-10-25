import React from "react";
import Link from "next/link";
import { Button, Card } from "@mui/material";
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";
import PageHeader from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/States";

export default function NotFound() {
  return (
    <>
      <PageHeader title="Page not found" />
      <Card>
        <EmptyState
          icon={TravelExploreOutlinedIcon}
          title="We couldn't find that page"
          description="It may have been moved or deleted."
          action={
            <Button component={Link} href="/dashboard" variant="contained">
              Back to dashboard
            </Button>
          }
        />
      </Card>
    </>
  );
}
