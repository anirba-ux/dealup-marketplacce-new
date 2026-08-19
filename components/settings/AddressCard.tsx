"use client";

interface AddressCardProps {
  state: string;
  district: string;
  city: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AddressCard({
  state,
  district,
  city,
  onChange,
}: AddressCardProps) {
  return (
    <div className="mt-10">
      <h2 className="mb-6 text-xl font-semibold">
        Address
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        <input
          name="state"
          placeholder="State"
          value={state}
          onChange={onChange}
          className="rounded-xl border px-4 py-3"
        />

        <input
          name="district"
          placeholder="District"
          value={district}
          onChange={onChange}
          className="rounded-xl border px-4 py-3"
        />

        <input
          name="city"
          placeholder="City"
          value={city}
          onChange={onChange}
          className="rounded-xl border px-4 py-3"
        />
      </div>
    </div>
  );
}