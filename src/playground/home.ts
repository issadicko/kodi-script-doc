/** Script shown on the home page next to its result. The build runs it, so a broken sample fails the build. */
export const homeScript = `let sales = [
  {region: "Centre", amount: 500},
  {region: "North", amount: 2100},
  {region: "Centre", amount: 1000},
]

let byRegion = sales.groupBy("region")
for (region in keys(byRegion)) {
  let total = byRegion[region].sumBy("amount")
  print("\${region}: \${total}")
}

let best = sales.maxBy("amount")
print("Best sale: \${best.region} (\${best.amount})")

return {regions: size(keys(byRegion)), revenue: sales.sumBy("amount")}
`;
