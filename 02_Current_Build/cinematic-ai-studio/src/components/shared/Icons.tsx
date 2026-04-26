import React from "react";

type P = React.SVGProps<SVGSVGElement>;
const base = (props: P) => ({
  width: 16, height: 16, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  ...props,
});

export const IconSlate = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M3 7l3-3h12l3 3" />
    <path d="M7 4l-1 3M11 4l-1 3M15 4l-1 3M19 4l-1 3" />
  </svg>
);
export const IconKey = (p: P) => (
  <svg {...base(p)}><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M16 7l3 3" /></svg>
);
export const IconUser = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" /></svg>
);
export const IconMap = (p: P) => (
  <svg {...base(p)}><path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" /></svg>
);
export const IconPlay = (p: P) => (<svg {...base(p)}><path d="M6 4l14 8-14 8V4z" fill="currentColor" /></svg>);
export const IconPause = (p: P) => (<svg {...base(p)}><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>);
export const IconRewind = (p: P) => (<svg {...base(p)}><path d="M11 5l-8 7 8 7V5zM21 5l-8 7 8 7V5z" fill="currentColor" /></svg>);
export const IconForward = (p: P) => (<svg {...base(p)}><path d="M13 5l8 7-8 7V5zM3 5l8 7-8 7V5z" fill="currentColor" /></svg>);
export const IconStar = (p: P & { filled?: boolean }) => {
  const { filled, ...rest } = p;
  return (
    <svg {...base(rest)} fill={filled ? "currentColor" : "none"}>
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6-5.4-2.9L6.6 19.8l1-6L3.2 9.5l6.1-.9L12 3z" />
    </svg>
  );
};
export const IconPlus = (p: P) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const IconClose = (p: P) => (<svg {...base(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const IconCopy = (p: P) => (<svg {...base(p)}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M4 16V6a2 2 0 0 1 2-2h10" /></svg>);
export const IconTrash = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12" />
    <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
  </svg>
);
export const IconUpload = (p: P) => (<svg {...base(p)}><path d="M12 16V4M6 10l6-6 6 6M4 20h16" /></svg>);
export const IconExport = (p: P) => (<svg {...base(p)}><path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /><path d="M16 8l-4-4-4 4M12 4v12" /></svg>);
export const IconWave = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 12h2M7 8v8M11 5v14M15 8v8M19 11v2M21 12h-2" />
  </svg>
);
export const IconLayers = (p: P) => (
  <svg {...base(p)}><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5M3 17l9 5 9-5" /></svg>
);
export const IconSparkle = (p: P) => (
  <svg {...base(p)}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" /></svg>
);
export const IconLink = (p: P) => (
  <svg {...base(p)}><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 1 0-5.66-5.66l-1 1" /><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 1 0 5.66 5.66l1-1" /></svg>
);
export const IconDiff = (p: P) => (
  <svg {...base(p)}><rect x="3" y="4" width="8" height="16" rx="1" /><rect x="13" y="4" width="8" height="16" rx="1" /><path d="M12 2v20" /></svg>
);
export const IconCamera = (p: P) => (
  <svg {...base(p)}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
export const IconAction = (p: P) => (
  <svg {...base(p)}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
