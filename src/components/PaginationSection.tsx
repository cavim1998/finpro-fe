"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PaginationMeta } from "@/types/pagination";

interface PaginationSectionProps {
  meta: PaginationMeta;
  onClick: (page: number) => void;
}

const PaginationSection = (props: PaginationSectionProps) => {
  const { meta, onClick } = props;

  const handlePrev = () => {
    if (meta.page > 1) {
      onClick(meta.page - 1);
    }
  };

  const handleNext = () => {
    const totalPage = Math.ceil(meta.total / meta.take);

    if (meta.page < totalPage) {
      onClick(meta.page + 1);
    }
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem onClick={handlePrev}>
          <PaginationPrevious />
        </PaginationItem>

        <PaginationItem>
          <PaginationLink>{meta.page}</PaginationLink>
        </PaginationItem>

        <PaginationItem onClick={handleNext}>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationSection;