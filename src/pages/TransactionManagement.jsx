import React, { useState } from "react";
import TransactionDetailSidebar from "../components/TransactionDeatilsSidebar";

const allTransactions = Array.from({ length: 68 }, (_, i) => {
  const statuses = ["Successful", "Pending", "Failed"];
  const types = ["Booking Payment", "Commission", "Refund", "Boosted Profile"];
  const methods = ["Credit Card", "PayPal", "Stripe"];
  const users = ["Emily Carter", "Olivia Jones", "Ava Smith", "Sophia Brown"];
  const amounts = ["$50", "$30", "-$200", "$100"];

  return {
    id: `#TRX-${String(i + 1).padStart(3, "0")}`,
    user: users[i % users.length],
    type: types[i % types.length],
    amount: amounts[i % amounts.length],
    method: methods[i % methods.length],
    datetime: `${10 + (i % 10)} Mar 2025, ${2 + (i % 8)}:${(i * 3) % 60} PM`,
    status: statuses[i % statuses.length],
  };
});

const statusColors = {
  Successful: "bg-[#D3FFCC] text-[#128807]",
  Pending: "bg-[#FFDBB7] text-[#B25F00]",
  Failed: "bg-[#FFD6D6] text-[#B00020]",
};

const TransactionManagement = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showSidebar, setShowSidebar] = useState(false);

  const filtered = allTransactions.filter((trx) =>
    (trx.id + trx.user + trx.type + trx.method + trx.status)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = filtered.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleDownloadCSV = () => {
    const csvContent = [
      [
        "Transaction ID",
        "User",
        "Type",
        "Amount",
        "Method",
        "DateTime",
        "Status",
      ],
      ...filtered.map((trx) => [
        trx.id,
        trx.user,
        trx.type,
        trx.amount,
        trx.method,
        trx.datetime,
        trx.status,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPagination = () => {
    const pagesToShow = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(currentPage - i) <= 1) {
        pagesToShow.push(i);
      } else if (pagesToShow[pagesToShow.length - 1] !== "...") {
        pagesToShow.push("...");
      }
    }

    return pagesToShow.map((page, index) =>
      page === "..." ? (
        <div
          key={`ellipsis-${index}`}
          className="px-4 py-2 rounded-lg inline-flex items-center text-sm text-[#999]"
        >
          ...
        </div>
      ) : (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`px-3 py-2 rounded-lg inline-flex items-center justify-center text-sm ${
            currentPage === page
              ? "bg-[#FF407D] text-white"
              : "text-[#292929] hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      )
    );
  };

  return (
    <div className="min-h-screen font-['Inter']">
      {/* Header */}
      <div className="kaab-support-header">
        <div>
          <h1 className="kaab-payment-heading">Transaction Management</h1>
          <p className="kaab-payment-subtext">
            Track, monitor, and manage all financial transactions across the
            platform.
          </p>
        </div>
      </div>

      <div className="kaab-search-filter-bar">
        <div className="search-box-c d-flex">
          <img src="/images/search-icon.png" alt="icon" />
          <input
            type="text"
            className="kaab-search-input"
            placeholder="Search by transaction ID, user name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>


<div className="flex flex-wrap gap-2 sm:gap-4">
            <div className="relative inline-flex items-center">
              <select
                className="pl-3 pr-[25px] py-2 bg-[#FFFFFF] rounded-full outline outline-1 outline-offset-[-1px] outline-[#656565] text-Token-Text-Secondary text-sm font-medium font-['Inter'] leading-tight appearance-none"
              >
                <option value="">Hostess</option>
                <option value="organiser">Organiser</option>
                <option value="staff">Staff</option>
                <option value="superadmin">Superadmin</option>
              </select>
              <div className="absolute right-2 pointer-events-none">
                <div className="w-5 h-5 relative flex items-center justify-center">
                  <i class="ri-arrow-down-s-line"></i>
                </div>
              </div>
            </div>
            <div className="relative inline-flex items-center">
              <select
                className="pl-3 pr-[25px] py-2  bg-[#FFFFFF] rounded-full outline outline-1 outline-offset-[-1px] outline-[#656565] text-Token-Text-Secondary text-sm font-medium font-['Inter'] leading-tight appearance-none"
              >
                <option value="">Hostess</option>
                <option value="1 hr">1 Hour</option>
                <option value="24 hrs">24 Hours</option>
              </select>
              <div className="absolute right-1 pointer-events-none">
                <div className="w-5 h-5 relative flex items-center justify-center">
                  <i className="ri-arrow-down-s-line text-Token-Text-Secondary text-lg" />
                </div>
              </div>
            </div>
            <div className="relative inline-flex items-center">
              <select
                className="pl-3 pr-[25px] py-2 bg-[#FFFFFF] rounded-full outline outline-1 outline-offset-[-1px] outline-[#656565] text-Token-Text-Secondary text-sm font-medium font-['Inter'] leading-tight appearance-none"
              >
                <option value="">Commission</option>
                <option value="Active">Active</option>
                <option value="Inactive">In Active</option>
              </select>
              <div className="absolute right-2 pointer-events-none">
                <div className="w-5 h-5 relative flex items-center justify-center">
                  <i className="ri-arrow-down-s-line text-Token-Text-Secondary text-lg" />
                </div>
              </div>
            </div>
            <div className="relative inline-flex items-center">
              <select
                className="pl-3 pr-[25px] py-2 bg-[#FFFFFF] rounded-full outline outline-1 outline-offset-[-1px] outline-[#656565] text-Token-Text-Secondary text-sm font-medium font-['Inter'] leading-tight appearance-none"
              >
                <option value="">Dec 2024 - Mar 2025</option>
                <option value="Active">Active</option>
                <option value="Inactive">In Active</option>
              </select>
              <div className="absolute right-2 pointer-events-none">
                <div className="w-5 h-5 relative flex items-center justify-center">
                  <i className="ri-arrow-down-s-line text-Token-Text-Secondary text-lg" />
                </div>
              </div>
            </div>
          </div>


      </div>

      {/* Table */}
      <div className="w-full h-full overflow-hidden rounded-2xl border border-[#ECECEC] flex flex-col zole-table mt-4">
        {/* Table Header */}
        <div className="flex w-full bg-white items-center table-heads">
          <div className="p-3 border-r border-[#ECECEC] flex justify-center items-center flex-[1.5]">
            <span className="text-[#3D3D3D] text-sm font-medium font-['Inter']">
              Transaction ID
            </span>
          </div>
          <div className="p-3 border-r border-[#ECECEC] flex justify-center items-center flex-1">
            <span className="text-[#3D3D3D] text-sm font-medium font-['Inter']">
              User Name
            </span>
          </div>
          <div className="p-3 border-r border-[#ECECEC] flex justify-center items-center flex-1">
            <span className="text-[#3D3D3D] text-sm font-medium font-['Inter']">
              Transaction Type
            </span>
          </div>
          <div className="p-3 border-r border-[#ECECEC] flex justify-center items-center flex-1">
            <span className="text-[#3D3D3D] text-sm font-medium font-['Inter']">
              Amount
            </span>
          </div>
          <div className="p-3 border-r border-[#ECECEC] flex justify-center items-center flex-1">
            <span className="text-[#3D3D3D] text-sm font-medium font-['Inter']">
              Payment Method
            </span>
          </div>
          <div className="p-3 border-r border-[#ECECEC] flex justify-center items-center flex-1">
            <span className="text-[#3D3D3D] text-sm font-medium font-['Inter']">
              Date & Time
            </span>
          </div>
          <div className="p-3 border-r border-[#ECECEC] flex justify-center items-center flex-1">
            <span className="text-[#3D3D3D] text-sm font-medium font-['Inter']">
              Status
            </span>
          </div>
          <div className="p-3 flex justify-center items-center flex-1">
            <span className="text-[#3D3D3D] text-sm font-medium font-['Inter']">
              Action
            </span>
          </div>
        </div>

        {/* Table Body */}
        {currentTransactions.map((trx, index) => (
          <div
            key={index}
            className="flex w-full border-b border-[#ECECEC] items-center table-bodies"
          >
            <div className="p-3 border-r border-[#ECECEC] flex justify-start items-center flex-[1.5] font-semibold text-sm text-[#292929]">
              {trx.id}
            </div>
            <div className="p-3 border-r border-[#ECECEC] flex justify-center items-center flex-1 text-sm">
              {trx.user}
            </div>
            <div className="p-3 border-r border-[#ECECEC] flex justify-center items-center flex-1 text-sm">
              {trx.type}
            </div>
            <div
              className={`p-3 border-r border-[#ECECEC] flex justify-center items-center flex-1 text-sm font-medium ${
                trx.amount.includes("-") ? "text-red-500" : "text-green-600"
              }`}
            >
              {trx.amount}
            </div>
            <div className="p-3 border-r border-[#ECECEC] flex justify-center items-center flex-1 text-sm">
              {trx.method}
            </div>
            <div className="p-3 border-r border-[#ECECEC] flex justify-center items-center flex-1 text-sm">
              {trx.datetime}
            </div>
            <div className="p-3 border-r border-[#ECECEC] flex justify-center items-center flex-1">
              <div
                className={`px-4 py-2 rounded-full text-xs font-medium ${
                  statusColors[trx.status]
                }`}
              >
                {trx.status}
              </div>
            </div>
            <div className="p-3 flex justify-center items-center flex-1">
              <button
                onClick={() => setShowSidebar(true)}
                className="text-pink-600 border border-pink-600 px-3 py-1 rounded-full hover:underline text-xs"
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="self-stretch inline-flex justify-between items-center mt-4 w-100">
        {/* Showing Dropdown */}
        <div className="flex items-center gap-2.5">
          <span className="text-[#7A7A7A] text-sm font-medium">Showing</span>
          <div className="px-3 py-2 bg-[#F7F7F7] rounded-full outline outline-1 outline-offset-[-1px] outline-[#DADADA] flex items-center gap-2">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent appearance-none outline-none text-[#7A7A7A] text-sm font-medium"
            >
              {[10, 20, 30, 50].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
            <i class="ri-arrow-down-s-line text-[#999]"></i>
          </div>
        </div>

        {/* Pagination numbers */}
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className={`px-3 py-2 rounded-lg text-sm ${
              currentPage === 1 ? "opacity-50" : "hover:bg-gray-100"
            }`}
          >
            Previous
          </button>
          {renderPagination()}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className={`px-3 py-2 rounded-lg text-sm ${
              currentPage === totalPages ? "opacity-50" : "hover:bg-gray-100"
            }`}
          >
            Next
          </button>
        </div>

        {/* Download CSV */}
        <button
          onClick={handleDownloadCSV}
          className="p-2 bg-[#F7F7F7] rounded-lg outline outline-1 outline-offset-[-1px] outline-[#ECECEC] flex items-center gap-2 hover:bg-gray-100"
        >
          <span className="text-[#7A7A7A] text-sm font-medium">
            Download CSV
          </span>
          <svg
            className="w-5 h-5 text-pink-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 5v14m0 0l-6-6m6 6l6-6m-6 6V5"
            />
          </svg>
        </button>
      </div>
      {showSidebar && (
        <TransactionDetailSidebar onClose={() => setShowSidebar(false)} />
      )}
    </div>
  );
};

export default TransactionManagement;
