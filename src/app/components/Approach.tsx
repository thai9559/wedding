import Image from "next/image";

export function Approach() {
  return (
    <section className="relative mt-20 overflow-hidden">
      <div className="relative h-[70vh]">
        <Image src="/images/main-banner.jpg" alt="Tablescape" fill className="object-cover" />
      </div>
      <div className="pointer-events-none absolute inset-0 grid place-items-center bg-gradient-to-t from-black/40 via-black/20 to-transparent">
        <div className="px-6 text-center text-white">
          <h3 className="text-[11px] tracking-[0.6em] mb-6">OUR APPROACH</h3>
          <p className="mx-auto max-w-3xl text-sm/relaxed text-white/90">
            Chúng tôi tạo nên không gian ấm áp nuôi dưỡng sự kết nối và câu chuyện. Kinh nghiệm sâu rộng trong lập
            kế hoạch lẫn styling giúp từng chi tiết hòa quyện tự nhiên.
          </p>
          <div className="mt-7 inline-flex items-center gap-3">
            <a href="#services" className="rounded-full border border-white/60 px-5 py-2 text-xs tracking-widest">
              LEARN MORE
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
