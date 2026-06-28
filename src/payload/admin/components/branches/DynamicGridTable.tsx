"use client";

import React, { useState } from "react";

import ConfirmModal from "../ui/ConfirmModal";
import { useListQuery, useConfig } from "@payloadcms/ui";
import { Eye, Pencil, Trash2, FileText } from "lucide-react";
import Link from "next/link";

export default function DynamicGridTable() {
  const { data, query, refineListData } = useListQuery();
  const config = useConfig();
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void; danger?: boolean } | null>(null);

  // 1. Automatically extract data and collection info from Payload's context
  const docs = data?.docs || [];
  const currentCollectionSlug = query?.collection || "branches";
  const adminBase = `/admin/collections/${currentCollectionSlug}`;

  // 2. Identify active filter columns dynamically
  const activeColumns = Array.isArray(query?.select) ? query.select : [];

  const handleDelete = (id: string | number) => {
    setConfirm({
      message: "Are you sure you want to delete this record?",
      onConfirm: async () => {
        const response = await fetch(
          `/payload-api/${currentCollectionSlug}/${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (response.ok) {
          await refineListData(query);
        }
      },
    });
  };

  return (
    <>
      {confirm ? <ConfirmModal {...confirm} confirmLabel="Delete" danger onCancel={() => setConfirm(null)} onConfirm={() => { confirm.onConfirm(); setConfirm(null) }} /> : null}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 p-2">
      {docs.map((doc: any) => {
        const editURL = `${adminBase}/${doc.id}`;

        const imageUrl = doc.image?.url || doc.avatar?.url || null;
        const displayTitle =
          doc.name || doc.title || doc.username || `ID: ${doc.id}`;

        return (
          <article
            key={doc.id}
            className="bg-white rounded-2xl shadow-sm border border-neutral-100 pb-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between min-h-[320px]"
          >
            <div>
              {/* Card Media Header */}
              <div className="h-36 bg-neutral-50 flex items-center justify-center rounded-t-2xl overflow-hidden mb-3 border-b border-neutral-100">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={displayTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText
                    className="text-neutral-300 w-12 h-12"
                    strokeWidth={1.5}
                  />
                )}
              </div>

              {/* Card Header & Global Action Layout */}
              <div className="flex items-start justify-between gap-3 px-4 mb-3">
                <h3 className="font-bold text-neutral-800 text-base line-clamp-1 flex-1">
                  {displayTitle}
                </h3>

                {/* Standard Payload Row Actions Rendered as Card Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={editURL}
                    className="p-1.5 rounded-full text-neutral-500 hover:bg-neutral-100"
                    aria-label="View"
                  >
                    <Eye size={16} />
                  </Link>
                  <Link
                    href={editURL}
                    className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50"
                    aria-label="Edit"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    onClick={() => void handleDelete(doc.id)}
                    className="p-1.5 rounded-full text-red-600 hover:bg-red-50"
                    type="button"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Dynamic Description List Content mapping Payload's Active Headers */}
              <dl className="px-4 text-sm text-neutral-600 space-y-1">
                {/* Always render primary fields if available */}
                {doc.address && (
                  <div>
                    <dt className="inline font-medium text-neutral-400">
                      Address:{" "}
                    </dt>
                    <dd className="inline">{doc.address}</dd>
                  </div>
                )}

                {/* Loop dynamically over columns selected by the Admin via the UI Header checkboxes */}
                {activeColumns.map((columnKey) => {
                  // Skip system keys or things already explicitly placed above
                  if (
                    ["id", "name", "title", "address", "image"].includes(
                      columnKey
                    )
                  )
                    return null;

                  const fieldValue = doc[columnKey];
                  if (fieldValue === undefined || fieldValue === null)
                    return null;

                  // Render logic helper if fields are embedded objects (e.g., relational user fields)
                  const parsedValue =
                    typeof fieldValue === "object"
                      ? fieldValue.email ||
                        fieldValue.name ||
                        JSON.stringify(fieldValue)
                      : String(fieldValue);

                  return (
                    <div
                      key={columnKey}
                      className="transition-all animate-fadeIn"
                    >
                      <dt className="inline font-medium text-neutral-400 capitalize">
                        {columnKey}:{" "}
                      </dt>
                      <dd className="inline text-neutral-700">{parsedValue}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>

            {/* Universal Metadata Footer */}
            <footer className="mt-4 pt-3 border-t border-neutral-100 px-4 flex justify-between text-xs text-neutral-400">
              <span className="truncate max-w-[120px]">
                {doc.updatedBy?.email || doc.createdBy?.email || "System"}
              </span>
              <span>
                {doc.updatedAt
                  ? new Date(doc.updatedAt).toLocaleDateString()
                  : "Recent"}
              </span>
            </footer>
          </article>
        );
      })}
    </div>
    </>
  );
}
