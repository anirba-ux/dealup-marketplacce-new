interface PersonalInfoCardProps {
  name: string;
  phone: string;
  email: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PersonalInfoCard({
  name,
  phone,
  email,
  onChange,
}: PersonalInfoCardProps) {
  return (
    <div className="mt-8">
      <h2 className="mb-6 text-xl font-semibold">
        Personal Information
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-medium">
            Full Name
          </label>

          <input
            name="name"
            value={name}
            onChange={onChange}
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Phone Number
          </label>

          <input
            name="phone"
            value={phone}
            onChange={onChange}
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block font-medium">
            Email Address
          </label>

          <input
            value={email}
            disabled
            className="w-full rounded-xl border bg-slate-100 px-4 py-3"
          />
        </div>
      </div>
    </div>
  );
}