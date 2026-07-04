import Image from 'next/image';

export default function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="توس‌رادیه"
      width={40}
      height={40}
      className="h-13 w-13 rounded-md object-contain"
    />
  );
}
