import type { Guest, SiteContent, Wish } from "./types";

// Sample data used until real content is entered in /admin.
const map = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

const TU_GIA = "10 Trần Đại Nghĩa, Phường Bà Rịa, TP. Hồ Chí Minh";

// Details from the printed cards (public/card). Gift accounts, photos and the
// album are still placeholders until they are entered in /admin.
export const seedContent: SiteContent = {
  groomName: "Công Minh",
  brideName: "Hương Linh",
  sides: {
    trai: {
      label: "Nhà trai",
      ceremonyName: "Lễ Tân Hôn",
      mainDateTime: "2026-11-14T18:00",
      location: "TP. Hồ Chí Minh",
      events: [
        {
          id: "ruoc-dau",
          title: "Lễ Rước Dâu",
          date: "2026-11-14",
          time: "11:00",
          venue: "Tư gia nhà gái",
          address: TU_GIA,
          mapUrl: map(TU_GIA),
          photo: "/sample/couple-2.jpg",
        },
        {
          id: "tiec-trai",
          title: "Tiệc Cưới",
          date: "2026-11-14",
          time: "18:00",
          venue: "Trung tâm Hội nghị Tiệc cưới Tân Sơn Nhất Pavillon — Sảnh Grand Diamond, Tầng 4",
          address: "202 Hoàng Văn Thụ, Phường Đức Nhuận, TP. Hồ Chí Minh",
          mapUrl: map("Tân Sơn Nhất Pavillon, 202 Hoàng Văn Thụ, Phường Đức Nhuận, TP. Hồ Chí Minh"),
          photo: "/sample/couple-1.jpg",
        },
      ],
    },
    gai: {
      label: "Nhà gái",
      ceremonyName: "Lễ Vu Quy",
      mainDateTime: "2026-11-15T17:00",
      location: "Bà Rịa, TP. Hồ Chí Minh",
      events: [
        {
          id: "vu-quy",
          title: "Lễ Vu Quy",
          date: "2026-11-14",
          time: "09:00",
          venue: "Tư gia",
          address: TU_GIA,
          mapUrl: map(TU_GIA),
          photo: "/sample/couple-2.jpg",
        },
        {
          id: "tiec-gai",
          title: "Tiệc Cưới",
          date: "2026-11-15",
          time: "17:00",
          venue: "Nhà hàng Bá Hùng",
          address: "58 Nguyễn Bình, Phường Bà Rịa, TP. Hồ Chí Minh",
          mapUrl: map("Nhà hàng Bá Hùng, 58 Nguyễn Bình, Phường Bà Rịa"),
          photo: "/sample/couple-1.jpg",
        },
      ],
    },
  },
  invite: {
    line: "Trân trọng kính mời",
    defaultGuest: "Quý khách và gia đình",
  },
  groom: {
    name: "Công Minh",
    father: "Ông Huỳnh Văn Vĩnh Thanh",
    mother: "Bà Võ Ngọc Quế Trâm",
    rank: "Trưởng nam",
    address: "217/14 Bà Hom, Phường Phú Lâm, TP. Hồ Chí Minh",
    photo: "/sample/couple-2.jpg",
    bio: "",
  },
  bride: {
    name: "Hương Linh",
    father: "Ông Nguyễn Văn Anh",
    mother: "Bà Lê Thị Hương",
    rank: "Trưởng nữ",
    address: TU_GIA,
    photo: "/sample/couple-1.jpg",
    bio: "",
  },
  heroPhoto: "/sample/couple-1.jpg",
  countdownPhoto: "/sample/couple-2.jpg",
  thanksPhoto: "/sample/couple-1.jpg",
  thanksMessage:
    "Ngày vui thêm phần viên mãn khi có sự hiện diện và chúc phúc của Quý khách!",
  dressCode: {
    colors: ["#ffffff", "#1f1f1f", "#b3261e"],
    note: "Rất vui nếu Quý khách chọn trang phục theo các tông màu này.",
  },
  gifts: [
    {
      label: "Mừng cưới chú rể",
      bank: "Vietcombank",
      accountNumber: "0123456789",
      accountName: "NGUYEN CONG MINH",
      qr: "",
    },
    {
      label: "Mừng cưới cô dâu",
      bank: "Techcombank",
      accountNumber: "9876543210",
      accountName: "LE HUONG LINH",
      qr: "",
    },
  ],
  album: [
    { id: "p1", url: "/sample/couple-1.jpg", alt: "" },
    { id: "p2", url: "/sample/couple-2.jpg", alt: "" },
    { id: "p3", url: "/sample/couple-2.jpg", alt: "" },
    { id: "p4", url: "/sample/couple-1.jpg", alt: "" },
    { id: "p5", url: "/sample/couple-1.jpg", alt: "" },
  ],
  music: { url: "/music/nhac-nen.mp3", title: "Nhạc nền" },
  og: {
    title: "Thiệp cưới {names}",
    guestTitle: "Trân trọng kính mời {guest} đến dự tiệc cưới của {names}",
    image: "/sample/couple-1.jpg",
  },
  sections: [
    { id: "hero", type: "hero", eyebrow: "", title: "", visible: true },
    { id: "calendar", type: "calendar", eyebrow: "Save the date", title: "", visible: true },
    { id: "couple", type: "couple", eyebrow: "Cô dâu & chú rể", title: "Đôi Nét Về Chúng Tôi", visible: true },
    { id: "events", type: "events", eyebrow: "Lịch trình", title: "Ngày Trọng Đại", visible: true },
    { id: "dresscode", type: "dresscode", eyebrow: "Dress code", title: "Màu Trang Phục", visible: true },
    { id: "album", type: "album", eyebrow: "Khoảnh khắc", title: "Album Ảnh Cưới", visible: true },
    { id: "wishes", type: "wishes", eyebrow: "Lời chúc", title: "Những Lời Chúc Tốt Đẹp", visible: true },
    { id: "gift", type: "gift", eyebrow: "Mừng cưới", title: "Hộp Mừng Cưới", visible: true },
    { id: "countdown", type: "countdown", eyebrow: "Save the date", title: "Đếm Ngược Đến Ngày Cưới", visible: true },
    { id: "thanks", type: "thanks", eyebrow: "Thank you", title: "", visible: true },
  ],
};

export const seedGuests: Guest[] = [
  {
    id: "g1",
    slug: "phuoc-vinh",
    salutation: "Anh",
    name: "Phước Vinh",
    side: "trai",
    createdAt: "2026-09-30T00:00:00.000Z",
  },
  {
    id: "g2",
    slug: "co-chu-tu",
    salutation: "Cô Chú",
    name: "Tư",
    side: "gai",
    createdAt: "2026-09-30T00:00:00.000Z",
  },
];

export const seedWishes: Wish[] = [
  {
    id: "w1",
    name: "Linh",
    message: "Chúc hai bạn trăm năm hạnh phúc!",
    createdAt: "2026-09-29T08:00:00.000Z",
    visible: true,
  },
];
