interface Props {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading...' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
      </div>
      <p className="text-green-700 font-medium">{message}</p>
    </div>
  );
}
