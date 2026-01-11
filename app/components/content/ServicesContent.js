export default function ServicesContent() {
  return (
    <div className="font-mono text-sm">
      <p className="text-[#888]">$ ./services.sh</p>

      {/* Header */}
      <pre className="mt-4 text-[#00ffff] whitespace-pre font-bold">{`
╔════════════════════════════════════════════════════════════╗
║                    RAIKHEN SERVICES                        ║
╚════════════════════════════════════════════════════════════╝
`}</pre>

      {/* AI Consulting */}
      <pre className="text-[#ff6b9d] whitespace-pre">
        {`┌──────────────────────────────────────────────────────────────┐
│  `}
        <span className="font-bold">AI CONSULTING</span>
        {`                                               │
│  `}
        <span className="text-[#ffb4d0]">
          Strategic guidance on AI adoption, from identifying
        </span>
        {`         │
│  `}
        <span className="text-[#ffb4d0]">
          opportunities to implementation planning.
        </span>
        {`                   │
└──────────────────────────────────────────────────────────────┘
`}
      </pre>

      {/* Custom Software */}
      <pre className="text-[#ffcc00] whitespace-pre">
        {`┌──────────────────────────────────────────────────────────────┐
│  `}
        <span className="font-bold">CUSTOM SOFTWARE</span>
        {`                                             │
│  `}
        <span className="text-[#ffe580]">
          Bespoke applications built to your exact specifications
        </span>
        {`     │
│  `}
        <span className="text-[#ffe580]">with modern technologies.</span>
        {`                                   │
└──────────────────────────────────────────────────────────────┘
`}
      </pre>

      {/* ML Integration */}
      <pre className="text-[#00ff88] whitespace-pre">
        {`┌──────────────────────────────────────────────────────────────┐
│  `}
        <span className="font-bold">ML INTEGRATION</span>
        {`                                              │
│  `}
        <span className="text-[#80ffbb]">
          Seamlessly integrate machine learning models into your
        </span>
        {`      │
│  `}
        <span className="text-[#80ffbb]">existing systems and workflows.</span>
        {`                             │
└──────────────────────────────────────────────────────────────┘
`}
      </pre>

      <pre className="text-[#888] whitespace-pre"></pre>
      <br />
      <p className="text-[#888]">
        Run &apos;cat services/&lt;service&gt;.txt&apos; for more details.
      </p>
    </div>
  );
}
