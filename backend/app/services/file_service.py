from pathlib import Path
from typing import Optional, Dict
import json

class CircuitFileService:
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        print(self.base_path)
        print(self.base_path.exists())
        
    def get_circuit_paths(self, circuit_name: str) -> Dict[str, Path]:
        """Get all paths related to a circuit"""
        circuit_dir = self.base_path / circuit_name
        return {
            "wasm": circuit_dir / f"{circuit_name}_js" / f"{circuit_name}.wasm",
            "zkey": circuit_dir / f"{circuit_name}.zkey",
            "vkey": circuit_dir / f"verification_key_{circuit_name}.json"
        }

    def verify_circuit_files(self, circuit_name: str) -> bool:
        """Verify all required files exist for a circuit"""
        paths = self.get_circuit_paths(circuit_name)
        return all(path.exists() for path in paths.values())

    def read_verification_key(self, circuit_name: str) -> Optional[dict]:
        """Read and parse verification key JSON"""
        vkey_path = self.get_circuit_paths(circuit_name)["vkey"]
        if vkey_path.exists():
            return json.loads(vkey_path.read_text())
        return None

    def list_available_circuits(self):
        """List all available circuits with valid files"""
        circuits = []
        for circuit_dir in self.base_path.iterdir():
            if circuit_dir.is_dir():
                circuit_name = circuit_dir.name
                if self.verify_circuit_files(circuit_name):
                    circuits.append({
                        "name": circuit_name,
                        "paths": {k: str(v) for k, v in self.get_circuit_paths(circuit_name).items()}
                    })
        return circuits 