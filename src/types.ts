export type Event = {
  start: string | Date;
  end: string | Date | null;
  title: string;
  url: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
};
