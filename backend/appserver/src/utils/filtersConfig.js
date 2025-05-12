const staticCompanyFilters = {
  size: {
    type: "string",
    operators: ["eq"],
    options: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001-10000", "10001+"]

  },
  founded: {
    type: "number",
    operators: ["gte", "lte", "eq"]
  },
  country: {
    type: "string",
    operators: ["eq", "ne"],
    options: ["afghanistan","albania","algeria","andorra","angola","anguilla","antigua and barbuda","argentina","armenia","aruba","australia","austria","azerbaijan","bahamas","bahrain","bangladesh","barbados","belarus","belgium","belize","benin","bermuda","bhutan","bolivia","bosnia and herzegovina","botswana","brazil","british virgin islands","brunei","bulgaria","burkina faso","burundi","cambodia","cameroon","canada","cape verde","caribbean netherlands","cayman islands","chad","chile","china","colombia","comoros","costa rica","croatia","cuba","curaçao","cyprus","czechia","côte d'ivoire","democratic republic of the congo","denmark","dominica","dominican republic","ecuador","egypt","el salvador","equatorial guinea","estonia","eswatini","ethiopia","faroe islands","fiji","finland","france","french guiana","french polynesia","french southern territories","gabon","georgia","germany","ghana","gibraltar","greece","guadeloupe","guam","guatemala","guernsey","guinea","guyana","haiti","honduras","hong kong","hungary","iceland","india","indonesia","iran","iraq","ireland","isle of man","israel","italy","jamaica","japan","jersey","jordan","kazakhstan","kenya","kosovo","kuwait","kyrgyzstan","laos","latvia","lebanon","lesotho","liberia","libya","liechtenstein","lithuania","luxembourg","macau","madagascar","malawi","malaysia","maldives","mali","malta","martinique","mauritania","mauritius","mexico","micronesia","moldova","monaco","mongolia","montenegro","morocco","mozambique","myanmar","namibia","nepal","netherlands","netherlands antilles","new caledonia","new zealand","nicaragua","nigeria","norfolk island","north macedonia","norway","oman","pakistan","palau","palestine","panama","papua new guinea","paraguay","peru","philippines","poland","portugal","puerto rico","qatar","republic of the congo","romania","russia","rwanda","réunion","saint kitts and nevis","saint lucia","saint vincent and the grenadines","san marino","saudi arabia","senegal","serbia","seychelles","sierra leone","singapore","slovakia","slovenia","somalia","south africa","south korea","south sudan","spain","sri lanka","sudan","suriname","sweden","switzerland","syria","são tomé and príncipe","taiwan","tajikistan","tanzania","thailand","the gambia","timor-leste","togo","tonga","trinidad and tobago","tunisia","turkey","u.s. virgin islands","uganda","ukraine","united arab emirates","united kingdom","united states","united states minor outlying islands","uruguay","uzbekistan","vanuatu","vatican city","venezuela","vietnam","yemen","zambia","zimbabwe","åland islands"],
    // for all options fields, they go into dropdown with searchable textfield to filter options
  },
  locality: {
    type: "string",
    operators: ["eq", "ne"] // no optyions means take filtering by input text
  },
  industry: {
    type: "string",
    operators: ["eq"],
    options: ["accounting","airlines/aviation","alternative dispute resolution","alternative medicine","animation","apparel & fashion","architecture & planning","arts and crafts","automotive","aviation & aerospace","banking","biotechnology","broadcast media","building materials","business supplies and equipment","capital markets","chemicals","civic & social organization","civil engineering","commercial real estate","computer & network security","computer games","computer hardware","computer networking","computer software","construction","consumer electronics","consumer goods","consumer services","cosmetics","dairy","defense & space","design","e-learning","education management","electrical/electronic manufacturing","entertainment","environmental services","events services","executive office","facilities services","farming","financial services","fine art","fishery","food & beverages","food production","fund-raising","furniture","gambling & casinos","glass, ceramics & concrete","government administration","government relations","graphic design","health, wellness and fitness","higher education","hospital & health care","hospitality","human resources","import and export","individual & family services","industrial automation","information services","information technology and services","insurance","international affairs","international trade and development","internet","investment banking","investment management","judiciary","law enforcement","law practice","legal services","legislative office","leisure, travel & tourism","libraries","logistics and supply chain","luxury goods & jewelry","machinery","management consulting","maritime","market research","marketing and advertising","mechanical or industrial engineering","media production","medical devices","medical practice","mental health care","military","mining & metals","motion pictures and film","museums and institutions","music","nanotechnology","newspapers","non-profit organization management","oil & energy","online media","outsourcing/offshoring","package/freight delivery","packaging and containers","paper & forest products","performing arts","pharmaceuticals","philanthropy","photography","plastics","political organization","primary/secondary education","printing","professional training & coaching","program development","public policy","public relations and communications","public safety","publishing","railroad manufacture","ranching","real estate","recreational facilities and services","religious institutions","renewables & environment","research","restaurants","retail","security and investigations","semiconductors","shipbuilding","sporting goods","sports","staffing and recruiting","supermarkets","telecommunications","textiles","think tanks","tobacco","translation and localization","transportation/trucking/railroad","utilities","venture capital & private equity","veterinary","warehousing","wholesale","wine and spirits","wireless","writing and editing"],
  }
};

async function getCompanyFiltersConfig() {
  return staticCompanyFilters;
}

module.exports = {
    getCompanyFiltersConfig,
}