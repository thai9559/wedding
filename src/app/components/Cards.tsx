import Image from "next/image";

const items = [
  { label: "Services" },
  { label: "Portfolio" },
  { label: "Studio" },
];

export function Cards() {
  return (
    <section id="services" className="mx-auto max-w-6xl px-6 pb-16 pt-14">
      <div className="grid gap-6 md:grid-cols-3">
        {items.map(({ label }) => (
          <article key={label} className="group">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/images/main-banner.jpg"
                alt={label}
                fill
                className="object-cover object-top transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="mt-3 text-center text-[11px] tracking-[0.3em] text-neutral-400">
              {label.toUpperCase()}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-8 text-[12px] text-neutral-500 md:grid-cols-2">
        <p>
          Cách tiếp cận của chúng tôi kết hợp quy trình tỉ mỉ với thẩm mỹ đương đại tối giản – đồng hành từ bắt đầu
          đến kết thúc, phối hợp nhà cung cấp và bảo chứng trải nghiệm liền mạch cho tất cả khách mời.
        </p>
        <p>
          Studio đặt tại trung tâm thành phố, với không gian sáng sủa và sưu tập đạo cụ tinh tế – sẵn sàng hiện thực
          hóa tầm nhìn và mở ra những khả năng sáng tạo mới.
        </p>
      </div>
    </section>
  );
}