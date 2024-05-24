import { Adapter } from "@/search";
import { useSearch } from "./useSearch";
import { Schema } from "@stereobooster/facets";
import { Checkbox } from "@/components/ui/checkbox";

export type ResultsProp<S extends Schema> = {
  adapter: Adapter<S>;
  facet: keyof S;
};

export default function Checkboxes<S extends Schema>({
  adapter,
  facet,
}: ResultsProp<S>) {
  const results = useSearch(adapter);

  if (!results.facets[facet]) return;

  return (
    <ul style={{ maxHeight: 150, overflowY: "scroll" }}>
      {results.facets[facet].items.map((x) => (
        <li
          key={[x[0]].join()}
          className="flex flex-row items-center space-x-3 space-y-0"
        >
          <Checkbox
            id={`${String(facet)}-${x[0]}`}
            onClick={(e) => {
              adapter.search({
                facetFilter: { [facet]: [x[0]] } as any,
              });
            }}
          />
          <label
            htmlFor={`${String(facet)}-${x[0]}`}
            className="text-sm select-none cursor-pointer"
          >
            <span>{x[0]}</span>
          </label>
          <span className="font-mono text-xs">{x[1]}</span>
        </li>
      ))}
    </ul>
  );
}
