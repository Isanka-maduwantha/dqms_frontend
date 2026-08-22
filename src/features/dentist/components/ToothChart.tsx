import type { Tooth, ToothCondition } from "../types/dentist";

// F-6.2: Interactive 32-Teeth SVG Chart
// Universal numbering: 1-16 upper arch (1 = patient's upper-right 3rd molar .. 16 = upper-left
// 3rd molar), 17-32 lower arch (17 = patient's lower-left 3rd molar .. 32 = lower-right 3rd molar).
// Charts are drawn as if facing the patient, so patient's right sits on screen-left.

const UPPER_ARCH = Array.from({ length: 16 }, (_, i) => i + 1); // 1..16, already screen L->R
const LOWER_ARCH = Array.from({ length: 16 }, (_, i) => 32 - i); // 32..17, screen L->R

const CONDITION_STYLE: Record<ToothCondition, { fill: string; stroke: string; label: string }> = {
  HEALTHY: { fill: "#FFFFFF", stroke: "#B9D6C8", label: "Healthy" },
  CAVITY: { fill: "#F87171", stroke: "#B91C1C", label: "Cavity" },
  FILLING: { fill: "#60A5FA", stroke: "#1D4ED8", label: "Filling" },
  CROWN: { fill: "#FBBF24", stroke: "#B45309", label: "Crown" },
  ROOT_CANAL: { fill: "#C084FC", stroke: "#7E22CE", label: "Root Canal" },
  EXTRACTED: { fill: "#E5E7EB", stroke: "#9CA3AF", label: "Extracted" },
  MISSING: { fill: "transparent", stroke: "#9CA3AF", label: "Missing" },
  OTHER: { fill: "#D1D5DB", stroke: "#6B7280", label: "Other" },
};

// Canonical tooth silhouette: narrow root near the gum line (y ~ -20) widening into a
// rounded crown (y ~ +17). Lower-arch teeth are drawn with this shape flipped vertically.
const TOOTH_PATH =
  "M -8,-16 C -8,-19 -4,-20 0,-20 C 4,-20 8,-19 8,-16 C 9,-12 8,-6 8,0 " +
  "C 8,7 6,14 0,17 C -6,14 -8,7 -8,0 C -8,-6 -9,-12 -8,-16 Z";

const VIEW_WIDTH = 640;
const MARGIN_X = 36;
const UPPER_BASE_Y = 70;
const LOWER_BASE_Y = 190;
const AMPLITUDE = 34;

function archPosition(index: number, count: number, baseY: number, direction: 1 | -1) {
  const t = count === 1 ? 0.5 : index / (count - 1);
  const x = MARGIN_X + t * (VIEW_WIDTH - 2 * MARGIN_X);
  const y = baseY + direction * AMPLITUDE * Math.sin(t * Math.PI);
  const scale = 0.82 + 0.22 * Math.sin(t * Math.PI); // incisors read slightly larger than molars
  return { x, y, scale };
}

interface ToothChartProps {
  teeth: Tooth[];
  selectedTooth: number | null;
  onSelectTooth: (toothNumber: number) => void;
}

export default function ToothChart({ teeth, selectedTooth, onSelectTooth }: ToothChartProps) {
  const byNumber = new Map(teeth.map((t) => [t.toothNumber, t]));

  const renderArch = (numbers: number[], baseY: number, direction: 1 | -1, flip: boolean) =>
    numbers.map((toothNumber, index) => {
      const tooth = byNumber.get(toothNumber);
      const condition = tooth?.condition ?? "HEALTHY";
      const style = CONDITION_STYLE[condition];
      const { x, y, scale } = archPosition(index, numbers.length, baseY, direction);
      const isSelected = selectedTooth === toothNumber;

      return (
        <g
          key={toothNumber}
          transform={`translate(${x},${y}) scale(${scale}${flip ? ",-1" : ",1"})`}
          onClick={() => onSelectTooth(toothNumber)}
          className="cursor-pointer"
          role="button"
          aria-label={`Tooth ${toothNumber}: ${style.label}`}
        >
          <path
            d={TOOTH_PATH}
            fill={style.fill}
            stroke={isSelected ? "#0E7A50" : style.stroke}
            strokeWidth={isSelected ? 3 : 1.5}
            strokeDasharray={condition === "MISSING" ? "3 3" : undefined}
          />
          {condition === "EXTRACTED" && (
            <g stroke="#6B7280" strokeWidth={2}>
              <line x1={-6} y1={-6} x2={6} y2={10} />
              <line x1={6} y1={-6} x2={-6} y2={10} />
            </g>
          )}
        </g>
      );
    });

  const renderNumbers = (numbers: number[], baseY: number, direction: 1 | -1) =>
    numbers.map((toothNumber, index) => {
      const { x, y } = archPosition(index, numbers.length, baseY, direction);
      const labelY = direction === 1 ? y - 28 : y + 28;
      return (
        <text
          key={toothNumber}
          x={x}
          y={labelY}
          textAnchor="middle"
          fontSize={10}
          className="fill-muted-green select-none"
        >
          {toothNumber}
        </text>
      );
    });

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${VIEW_WIDTH} 260`} className="w-full h-auto max-w-2xl mx-auto">
        <line x1={MARGIN_X} y1={130} x2={VIEW_WIDTH - MARGIN_X} y2={130} stroke="#DDEAE3" strokeDasharray="4 4" />
        {renderNumbers(UPPER_ARCH, UPPER_BASE_Y, 1)}
        {renderArch(UPPER_ARCH, UPPER_BASE_Y, 1, false)}
        {renderArch(LOWER_ARCH, LOWER_BASE_Y, -1, true)}
        {renderNumbers(LOWER_ARCH, LOWER_BASE_Y, -1)}
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2 text-[11px] text-muted-green">
        {(Object.keys(CONDITION_STYLE) as ToothCondition[]).map((condition) => (
          <div key={condition} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full border"
              style={{ backgroundColor: CONDITION_STYLE[condition].fill, borderColor: CONDITION_STYLE[condition].stroke }}
            />
            {CONDITION_STYLE[condition].label}
          </div>
        ))}
      </div>
    </div>
  );
}
